import {
  ImapFlow,
  type MessageEnvelopeObject,
  type MessageStructureObject,
} from 'imapflow'
import PostalMime from 'postal-mime'
import {
  decodeMailId,
  buildImapSearch,
  encodeMailId,
  encodeThreadId,
  MailnaraIdentifierError,
  isMailInDateRange,
  normalizeMailDate,
  parseGmailQuery,
  parseMailnaraConfig,
  type MailnaraConfig,
} from './mailnara-core'

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
type CachedMetadata = {
  readonly envelope: MessageEnvelopeObject
  readonly structure: MessageStructureObject | undefined
}

export class MailnaraAuthError extends Error {
  override readonly name = 'MailnaraAuthError'
  readonly code = 401

  constructor(cause?: unknown) {
    super('Mailnara IMAP authentication failed', { cause })
  }
}

function addressText(envelope: MessageEnvelopeObject): string {
  const from = envelope.from?.[0]
  const address = from?.address ?? ''
  const name = from?.name ?? ''
  return name ? `${name} <${address}>` : address
}

function threadSource(envelope: MessageEnvelopeObject): string {
  const normalizedSubject = (envelope.subject ?? '').replace(/^(re|fw|fwd):\s*/gi, '').trim().toLowerCase()
  return envelope.inReplyTo ?? envelope.messageId ?? normalizedSubject
}

function structureNodes(structure: MessageStructureObject | undefined): MessageStructureObject[] {
  if (!structure) return []
  return [structure, ...(structure.childNodes?.flatMap(structureNodes) ?? [])]
}

function attachmentNode(node: MessageStructureObject): boolean {
  const name = node.dispositionParameters?.filename ?? node.parameters?.name ?? ''
  return node.disposition?.toLowerCase() === 'attachment' || Boolean(name)
}

function attachmentId(part: string): string {
  return `a1.${Buffer.from(part).toString('base64url')}`
}

function decodeAttachmentId(value: string): string | undefined {
  const encoded = /^a1\.([A-Za-z0-9_-]+)$/.exec(value)?.[1]
  return encoded ? Buffer.from(encoded, 'base64url').toString('utf8') : undefined
}

function toGmailMessage(
  id: string,
  metadata: CachedMetadata,
  bodies: Record<string, { readonly content: Buffer | null }>,
): GmailMessage {
  const { envelope, structure } = metadata
  const date = normalizeMailDate(envelope.date)
  const headers: GmailHeader[] = [
    { name: 'Subject', value: envelope.subject ?? '' },
    { name: 'From', value: addressText(envelope) },
    { name: 'Date', value: date?.toUTCString() ?? '' },
    { name: 'Message-ID', value: envelope.messageId ?? '' },
  ]
  const parts: GmailPart[] = []
  for (const node of structureNodes(structure)) {
    if (!node.part) continue
    if (node.type === 'text/html' || node.type === 'text/plain') {
      const content = bodies[node.part]?.content
      if (content) parts.push({ mimeType: node.type, body: { data: content.toString('base64url') } })
      continue
    }
    if (attachmentNode(node)) {
      parts.push({
        mimeType: node.type,
        filename: node.dispositionParameters?.filename ?? node.parameters?.name ?? 'attachment',
        body: { attachmentId: attachmentId(node.part), size: node.size },
      })
    }
  }
  return {
    id,
    threadId: encodeThreadId(threadSource(envelope)),
    payload: { mimeType: 'multipart/mixed', headers, body: {}, parts },
  }
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
  private readonly metadata = new Map<number, CachedMetadata>()
  private readonly messages = new Map<number, GmailMessage>()
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

  private async loadMetadata(uid: number): Promise<CachedMetadata> {
    const cached = this.metadata.get(uid)
    if (cached) return cached
    if (this.closeTimer) clearTimeout(this.closeTimer)
    const fetched = await this.client.fetchOne(uid.toString(), { envelope: true, bodyStructure: true }, { uid: true })
    if (!fetched || !fetched.envelope) throw new MailnaraIdentifierError()
    const metadata = { envelope: fetched.envelope, structure: fetched.bodyStructure }
    this.metadata.set(uid, metadata)
    return metadata
  }

  private async load(uid: number): Promise<GmailMessage> {
    const cached = this.messages.get(uid)
    if (cached) return cached
    const metadata = await this.loadMetadata(uid)
    const textParts = structureNodes(metadata.structure)
      .filter(node => node.part && (node.type === 'text/html' || node.type === 'text/plain'))
      .map(node => node.part as string)
    const bodies = textParts.length > 0
      ? await this.client.downloadMany(uid.toString(), textParts, { uid: true })
      : {}
    const message = toGmailMessage(encodeMailId(this.uidValidity, uid), metadata, bodies)
    this.messages.set(uid, message)
    return message
  }

  private async prefetchMessages(uids: readonly number[]): Promise<void> {
    const parts = [...new Set(uids.flatMap(uid => structureNodes(this.metadata.get(uid)?.structure)
      .filter(node => node.part && (node.type === 'text/html' || node.type === 'text/plain'))
      .map(node => node.part as string)))]
    if (uids.length === 0 || parts.length === 0) return
    const bodyParts = parts.flatMap(part => [`${part}.mime`, part])
    const fetched = await this.client.fetchAll([...uids], { bodyParts }, { uid: true })
    for (const item of fetched) {
      const metadata = this.metadata.get(item.uid)
      if (!metadata || !item.bodyParts) continue
      const bodies: Record<string, { content: Buffer | null }> = {}
      for (const node of structureNodes(metadata.structure)) {
        if (!node.part || (node.type !== 'text/html' && node.type !== 'text/plain')) continue
        const mime = item.bodyParts.get(`${node.part}.mime`)
        const content = item.bodyParts.get(node.part)
        if (!content) continue
        const parsed = await PostalMime.parse(mime ? Buffer.concat([mime, Buffer.from('\r\n'), content]) : content)
        const text = node.type === 'text/html' ? parsed.html : parsed.text
        bodies[node.part] = { content: text ? Buffer.from(text) : content }
      }
      this.messages.set(item.uid, toGmailMessage(encodeMailId(this.uidValidity, item.uid), metadata, bodies))
    }
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
    const searchedUids = await this.client.search(buildImapSearch(query), { uid: true }) || []
    let uids = searchedUids
    if (searchedUids.length > 0 && (query.after || query.before || query.hasAttachment || query.filename)) {
      const metadata = await this.client.fetchAll(
        searchedUids,
        { envelope: true, internalDate: true, bodyStructure: query.hasAttachment || Boolean(query.filename) },
        { uid: true },
      )
      uids = metadata.filter(item => {
        if (!isMailInDateRange(
          query,
          normalizeMailDate(item.envelope?.date),
          normalizeMailDate(item.internalDate),
        )) return false
        if ((query.hasAttachment || query.filename) && !attachmentMatches(item.bodyStructure, query.filename)) return false
        return true
      }).map(item => {
        if (item.envelope) this.metadata.set(item.uid, { envelope: item.envelope, structure: item.bodyStructure })
        return item.uid
      })
    }
    const offset = Number(options.pageToken ?? '0')
    const limit = options.maxResults ?? 100
    const page = uids.slice(offset, offset + limit)
    const nextOffset = offset + page.length
    await this.prefetchMessages(page)
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
    const message = await this.load(identity.uid)
    this.scheduleClose()
    return { data: message }
  }

  private async getAttachment(options: {
    readonly id: string
    readonly messageId: string
  }): Promise<{ readonly data: { readonly data: string } }> {
    const identity = decodeMailId(options.messageId)
    if (identity.uidValidity !== this.uidValidity) throw new MailnaraIdentifierError()
    const part = decodeAttachmentId(options.id)
    if (!part) throw new MailnaraIdentifierError()
    const metadata = await this.loadMetadata(identity.uid)
    const attachment = structureNodes(metadata.structure).find(node => node.part === part && attachmentNode(node))
    if (!attachment) throw new MailnaraIdentifierError()
    const downloaded = await this.client.downloadMany(identity.uid.toString(), [part], { uid: true })
    const content = downloaded[part]?.content
    if (!content) throw new MailnaraIdentifierError()
    this.scheduleClose()
    return { data: { data: content.toString('base64url') } }
  }

  close(): void {
    if (this.closeTimer) clearTimeout(this.closeTimer)
    this.client.close()
  }
}

export async function createMailnaraGmailClient(runtimeConfig: unknown): Promise<MailnaraGmailClient> {
  return MailnaraGmailClient.connect(parseMailnaraConfig(runtimeConfig))
}
