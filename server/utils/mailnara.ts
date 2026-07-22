import { ImapFlow, type MessageStructureObject, type SearchObject } from 'imapflow'
import PostalMime, { type Email } from 'postal-mime'
import {
  decodeMailId,
  encodeMailId,
  encodeThreadId,
  MailnaraIdentifierError,
  normalizeMailDate,
  parseGmailQuery,
  parseMailnaraConfig,
  type MailnaraConfig,
  type ParsedGmailQuery,
} from './mailnara-core.ts'

type GmailHeader = { readonly name: string; readonly value: string }
type GmailPart = {
  readonly mimeType: string
  readonly filename?: string
  readonly headers?: readonly GmailHeader[]
  readonly body: { readonly data?: string; readonly attachmentId?: string; readonly size?: number }
  readonly parts?: readonly GmailPart[]
}
type GmailMessage = {
  readonly id: string
  readonly threadId: string
  readonly payload: GmailPart & { readonly headers: readonly GmailHeader[] }
}
type CachedMail = { readonly message: GmailMessage; readonly parsed: Email }

export class MailnaraAuthError extends Error {
  override readonly name = 'MailnaraAuthError'
  readonly code = 401

  constructor(cause?: unknown) {
    super('Mailnara IMAP authentication failed', { cause })
  }
}

function addressText(email: Email): string {
  const address = email.from?.address ?? ''
  const name = email.from?.name ?? ''
  return name ? `${name} <${address}>` : address
}

function threadSource(email: Email): string {
  const references = email.headers.find(header => header.key.toLowerCase() === 'references')?.value
  const inReplyTo = email.headers.find(header => header.key.toLowerCase() === 'in-reply-to')?.value
  const normalizedSubject = (email.subject ?? '').replace(/^(re|fw|fwd):\s*/gi, '').trim().toLowerCase()
  return references?.split(/\s+/)[0] ?? inReplyTo ?? email.messageId ?? normalizedSubject
}

function contentBytes(content: string | ArrayBuffer | Uint8Array): Uint8Array {
  if (typeof content === 'string') return Buffer.from(content)
  if (content instanceof ArrayBuffer) return new Uint8Array(content)
  return content
}

function toGmailMessage(id: string, email: Email): GmailMessage {
  const date = normalizeMailDate(email.date)
  const headers: GmailHeader[] = [
    { name: 'Subject', value: email.subject ?? '' },
    { name: 'From', value: addressText(email) },
    { name: 'Date', value: date?.toUTCString() ?? '' },
    { name: 'Message-ID', value: email.messageId ?? '' },
  ]
  const parts: GmailPart[] = []
  if (email.html) {
    parts.push({ mimeType: 'text/html', body: { data: Buffer.from(email.html).toString('base64url') } })
  }
  if (email.text) {
    parts.push({ mimeType: 'text/plain', body: { data: Buffer.from(email.text).toString('base64url') } })
  }
  email.attachments.forEach((attachment, index) => {
    parts.push({
      mimeType: attachment.mimeType,
      filename: attachment.filename ?? 'attachment',
      body: { attachmentId: `a1.${index}`, size: contentBytes(attachment.content).byteLength },
    })
  })
  return {
    id,
    threadId: encodeThreadId(threadSource(email)),
    payload: { mimeType: 'multipart/mixed', headers, body: {}, parts },
  }
}

function buildSearch(query: ParsedGmailQuery): SearchObject {
  const search: SearchObject = { all: true }
  if (query.after) search.since = query.after
  if (query.before) search.before = query.before
  if (query.from) search.from = query.from
  if (query.subjects.length === 1) search.subject = query.subjects[0]
  if (query.subjects.length > 1) search.or = query.subjects.map(subject => ({ subject }))
  if (query.text[0]) search.text = query.text[0]
  return search
}

function attachmentMatches(structure: MessageStructureObject | undefined, filename: string | undefined): boolean {
  if (!structure) return false
  const name = structure.dispositionParameters?.filename ?? structure.parameters?.name ?? ''
  const isAttachment = structure.disposition?.toLowerCase() === 'attachment' || Boolean(name)
  if (isAttachment && (!filename || name.toLowerCase().includes(filename.toLowerCase()))) return true
  return structure.childNodes?.some(child => attachmentMatches(child, filename)) ?? false
}

export class MailnaraGmailClient {
  readonly users = {
    getProfile: async (_options: { readonly userId: string }) => this.getProfile(),
    messages: {
      list: async (options: {
        readonly userId: string
        readonly q?: string
        readonly maxResults?: number
        readonly pageToken?: string
      }) => this.list(options),
      get: async (options: {
        readonly userId: string
        readonly id: string
        readonly format?: string
        readonly metadataHeaders?: readonly string[]
      }) => this.get(options),
      attachments: {
        get: async (options: {
          readonly userId: string
          readonly id: string
          readonly messageId: string
        }) => this.getAttachment(options),
      },
    },
  }

  private readonly client: ImapFlow
  private readonly config: MailnaraConfig
  private readonly cache = new Map<number, CachedMail>()
  private closeTimer: ReturnType<typeof setTimeout> | undefined
  private uidValidity = BigInt(0)

  private constructor(config: MailnaraConfig) {
    this.config = config
    this.client = new ImapFlow({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.password },
      logger: false,
      emitLogs: false,
    })
  }

  static async connect(config: MailnaraConfig): Promise<MailnaraGmailClient> {
    const facade = new MailnaraGmailClient(config)
    try {
      await facade.client.connect()
      const mailbox = await facade.client.mailboxOpen(config.mailbox, { readOnly: true })
      facade.uidValidity = mailbox.uidValidity
      facade.scheduleClose()
      return facade
    } catch (error) {
      facade.client.close()
      throw new MailnaraAuthError(error)
    }
  }

  private scheduleClose(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer)
    this.closeTimer = setTimeout(() => this.client.close(), 60000)
    this.closeTimer.unref()
  }

  private async load(uid: number): Promise<CachedMail> {
    const cached = this.cache.get(uid)
    if (cached) return cached
    if (this.closeTimer) clearTimeout(this.closeTimer)
    const fetched = await this.client.fetchOne(uid.toString(), { source: true }, { uid: true })
    if (!fetched || !fetched.source) throw new MailnaraIdentifierError()
    const parsed = await PostalMime.parse(fetched.source)
    const id = encodeMailId(this.uidValidity, uid)
    const mail = { parsed, message: toGmailMessage(id, parsed) }
    this.cache.set(uid, mail)
    return mail
  }

  private async getProfile(): Promise<{ readonly data: { readonly emailAddress: string; readonly messagesTotal: number } }> {
    this.scheduleClose()
    const mailbox = this.client.mailbox
    return { data: { emailAddress: this.config.user, messagesTotal: mailbox ? mailbox.exists : 0 } }
  }

  private async list(options: {
    readonly q?: string
    readonly maxResults?: number
    readonly pageToken?: string
  }): Promise<{ readonly data: { readonly messages: readonly { readonly id: string; readonly threadId: string }[]; readonly nextPageToken?: string } }> {
    if (this.closeTimer) clearTimeout(this.closeTimer)
    const query = parseGmailQuery(options.q ?? '')
    const searchedUids = await this.client.search(buildSearch(query), { uid: true }) || []
    let uids = searchedUids
    if (searchedUids.length > 0 && (query.after || query.before || query.hasAttachment || query.filename)) {
      const metadata = await this.client.fetchAll(
        searchedUids,
        { internalDate: true, bodyStructure: query.hasAttachment || Boolean(query.filename) },
        { uid: true },
      )
      uids = metadata.filter(item => {
        if (query.after && item.internalDate && item.internalDate <= query.after) return false
        if (query.before && item.internalDate && item.internalDate >= query.before) return false
        if ((query.hasAttachment || query.filename) && !attachmentMatches(item.bodyStructure, query.filename)) return false
        return true
      }).map(item => item.uid)
    }
    const offset = Number(options.pageToken ?? '0')
    const limit = options.maxResults ?? 100
    const page = uids.slice(offset, offset + limit)
    const nextOffset = offset + page.length
    this.scheduleClose()
    return {
      data: {
        messages: page.map(uid => ({
          id: encodeMailId(this.uidValidity, uid),
          threadId: encodeThreadId(`${this.uidValidity}.${uid}`),
        })),
        ...(nextOffset < uids.length ? { nextPageToken: String(nextOffset) } : {}),
      },
    }
  }

  private async get(options: { readonly id: string }): Promise<{ readonly data: GmailMessage }> {
    const identity = decodeMailId(options.id)
    if (identity.uidValidity !== this.uidValidity) throw new MailnaraIdentifierError()
    const message = (await this.load(identity.uid)).message
    this.scheduleClose()
    return { data: message }
  }

  private async getAttachment(options: {
    readonly id: string
    readonly messageId: string
  }): Promise<{ readonly data: { readonly data: string } }> {
    const identity = decodeMailId(options.messageId)
    if (identity.uidValidity !== this.uidValidity) throw new MailnaraIdentifierError()
    const match = /^a1\.(\d+)$/.exec(options.id)
    const index = match?.[1] ? Number(match[1]) : -1
    const attachment = (await this.load(identity.uid)).parsed.attachments[index]
    if (!attachment) throw new MailnaraIdentifierError()
    this.scheduleClose()
    return { data: { data: Buffer.from(contentBytes(attachment.content)).toString('base64url') } }
  }

  close(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer)
    this.client.close()
  }
}

export async function createMailnaraGmailClient(runtimeConfig: unknown): Promise<MailnaraGmailClient> {
  return MailnaraGmailClient.connect(parseMailnaraConfig(runtimeConfig))
}
