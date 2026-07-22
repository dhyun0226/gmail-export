import { createHash } from 'node:crypto'
import { z } from 'zod'

export type MailnaraConfig = {
  readonly host: string
  readonly port: number
  readonly secure: boolean
  readonly user: string
  readonly password: string
  readonly mailbox: string
}

export type ParsedGmailQuery = {
  readonly after: Date | undefined
  readonly before: Date | undefined
  readonly hasAttachment: boolean
  readonly filename: string | undefined
  readonly text: readonly string[]
  readonly from: string | undefined
  readonly subjects: readonly string[]
}

export type MailIdentity = {
  readonly uidValidity: bigint
  readonly uid: number
}

type ResponseLifecycle = {
  once(eventName: 'finish' | 'close', listener: () => void): unknown
}

const ConfigSchema = z.object({
  mailImapHost: z.string().trim().min(1),
  mailImapPort: z.coerce.number().int().min(1).max(65535),
  mailImapSecure: z.union([z.literal('true'), z.literal('false'), z.boolean()])
    .transform(value => value === true || value === 'true'),
  mailImapUser: z.string().trim().min(1),
  mailImapPassword: z.string().min(1),
  mailImapMailbox: z.string().trim().min(1),
})

export class MailnaraConfigError extends Error {
  override readonly name = 'MailnaraConfigError'

  constructor() {
    super('Mailnara IMAP configuration is invalid')
  }
}

export class MailnaraIdentifierError extends Error {
  override readonly name = 'MailnaraIdentifierError'

  constructor() {
    super('Invalid Mailnara message identifier')
  }
}

export function parseMailnaraConfig(input: unknown): MailnaraConfig {
  const result = ConfigSchema.safeParse(input)
  if (!result.success) throw new MailnaraConfigError()

  return {
    host: result.data.mailImapHost,
    port: result.data.mailImapPort,
    secure: result.data.mailImapSecure,
    user: result.data.mailImapUser,
    password: result.data.mailImapPassword,
    mailbox: result.data.mailImapMailbox,
  }
}

function parseQueryDate(value: string | undefined): Date | undefined {
  if (!value) return undefined
  const numeric = Number(value)
  const date = Number.isFinite(numeric)
    ? new Date(numeric * 1000)
    : new Date(value.replaceAll('/', '-'))
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function parseGmailQuery(query: string): ParsedGmailQuery {
  const after = parseQueryDate(query.match(/\bafter:([^\s]+)/i)?.[1])
  const before = parseQueryDate(query.match(/\bbefore:([^\s]+)/i)?.[1])
  const from = query.match(/\bfrom:([^\s]+)/i)?.[1]
  const filename = query.match(/\bfilename:([^\s]+)/i)?.[1]
  const subjectExpression = query.match(/\bsubject:\(([^)]*)\)/i)?.[1]
  const subjects = subjectExpression
    ? [...subjectExpression.matchAll(/"([^"]+)"/g)].map(match => match[1] ?? '').filter(Boolean)
    : [query.match(/\bsubject:("[^"]+"|[^\s]+)/i)?.[1]?.replace(/^"|"$/g, '')].filter(
      (value): value is string => Boolean(value),
    )

  let remainder = query
    .replace(/\b(after|before|from|filename):[^\s]+/gi, ' ')
    .replace(/\bhas:attachment\b/gi, ' ')
    .replace(/\bsubject:\([^)]*\)/gi, ' ')
    .replace(/\bsubject:("[^"]+"|[^\s]+)/gi, ' ')
  const quoted = [...remainder.matchAll(/"([^"]+)"/g)].map(match => match[1] ?? '').filter(Boolean)
  remainder = remainder.replace(/"[^"]+"/g, ' ').replace(/\bOR\b/gi, ' ').trim()
  const text = [...quoted, ...remainder.split(/\s+/).filter(Boolean)]

  return {
    after,
    before,
    hasAttachment: /\bhas:attachment\b/i.test(query),
    filename,
    text,
    from,
    subjects,
  }
}

export function encodeMailId(uidValidity: bigint, uid: number): string {
  return `m1.${uidValidity}.${uid}`
}

export function decodeMailId(value: string): MailIdentity {
  const match = /^m1\.(\d+)\.(\d+)$/.exec(value)
  if (!match?.[1] || !match[2]) throw new MailnaraIdentifierError()
  const uid = Number(match[2])
  if (!Number.isSafeInteger(uid) || uid < 1) throw new MailnaraIdentifierError()
  return { uidValidity: BigInt(match[1]), uid }
}

export function encodeThreadId(value: string): string {
  return `t1.${createHash('sha256').update(value).digest('base64url').slice(0, 24)}`
}

export function normalizeMailDate(value: Date | string | undefined): Date | undefined {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export function closeMailClientAfterResponse(response: ResponseLifecycle, close: () => void): void {
  let closed = false
  const closeOnce = () => {
    if (closed) return
    closed = true
    close()
  }
  response.once('finish', closeOnce)
  response.once('close', closeOnce)
}
