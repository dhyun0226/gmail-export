export type MailListRow = { receivedAt: unknown; subject: unknown }
export type MailTimeMap = Record<string, string>
export type DelayReason = { reason: string; controllable: string }

const DHL_BL_PATTERN = /\bDHL\s*[-:]?\s*(\d{10})\b/i

export function normalizeMailReceivedAt(value: unknown): string | undefined {
  const text = String(value ?? '').trim()
  const compact = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(text)
  if (compact) {
    const [, year, month, day, hour, minute, second] = compact
    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`)
    if (!Number.isNaN(date.getTime())) return `${year}-${month}-${day} ${hour}:${minute}`
  }
  const date = value instanceof Date ? value : new Date(text)
  if (Number.isNaN(date.getTime())) return undefined
  const pad = (number: number) => String(number).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function extractDhlBlNumber(subject: unknown): string | undefined {
  return DHL_BL_PATTERN.exec(String(subject ?? '').trim())?.[1]
}

export function buildMailTimeMap(rows: readonly MailListRow[]): MailTimeMap {
  const earliestBySubject = new Map<string, string>()
  for (const row of rows) {
    const subject = String(row.subject ?? '').trim()
    const receivedAt = normalizeMailReceivedAt(row.receivedAt)
    if (!subject || !receivedAt || !extractDhlBlNumber(subject)) continue
    const existing = earliestBySubject.get(subject)
    if (!existing || receivedAt < existing) earliestBySubject.set(subject, receivedAt)
  }

  const result: MailTimeMap = {}
  for (const [subject, receivedAt] of earliestBySubject) {
    const blNumber = extractDhlBlNumber(subject)
    if (blNumber && (!result[blNumber] || receivedAt < result[blNumber])) result[blNumber] = receivedAt
  }
  return result
}

export function applyMailDelayReason(
  existing: DelayReason | null,
  hasMatchedMail: boolean,
): DelayReason | null {
  if (!hasMatchedMail) return existing
  if (existing && existing.reason !== "Out of broker's office hours") return existing
  return { reason: 'Pre-alert missing by carriers', controllable: 'Uncontrollable' }
}
