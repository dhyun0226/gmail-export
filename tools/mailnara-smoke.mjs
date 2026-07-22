import { createMailnaraGmailClient } from '../server/utils/mailnara.ts'

const client = await createMailnaraGmailClient({
  mailImapHost: process.env.MAIL_IMAP_HOST,
  mailImapPort: process.env.MAIL_IMAP_PORT ?? '993',
  mailImapSecure: process.env.MAIL_IMAP_SECURE ?? 'true',
  mailImapUser: process.env.MAIL_IMAP_USER,
  mailImapPassword: process.env.MAIL_IMAP_PASSWORD,
  mailImapMailbox: process.env.MAIL_IMAP_MAILBOX ?? 'INBOX',
})
const since = Math.floor((Date.now() - 180 * 24 * 60 * 60 * 1000) / 1000)

const list = await client.users.messages.list({
  userId: 'me',
  q: `after:${since} has:attachment`,
  maxResults: 5,
})
const first = list.data.messages[0]
if (!first?.id) throw new Error('No matching messages')

const detail = await client.users.messages.get({ userId: 'me', id: first.id, format: 'full' })
const attachment = detail.data.payload.parts?.find(part => part.body.attachmentId)
let attachmentBytes = 0
if (attachment?.body.attachmentId) {
  const downloaded = await client.users.messages.attachments.get({
    userId: 'me',
    messageId: first.id,
    id: attachment.body.attachmentId,
  })
  attachmentBytes = Buffer.from(downloaded.data.data, 'base64url').length
}

console.log(JSON.stringify({
  listCount: list.data.messages.length,
  detailIdMatches: detail.data.id === first.id,
  hasHeaders: (detail.data.payload.headers?.length ?? 0) > 0,
  hasBodyParts: (detail.data.payload.parts?.length ?? 0) > 0,
  attachmentReadable: attachmentBytes > 0,
  attachmentBytes,
}))
client.close()
