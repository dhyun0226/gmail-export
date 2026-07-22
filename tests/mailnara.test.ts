import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  decodeMailId,
  encodeMailId,
  normalizeMailDate,
  parseGmailQuery,
  parseMailnaraConfig,
} from '../server/utils/mailnara-core.ts'

describe('parseMailnaraConfig', () => {
  it('parses a valid private runtime configuration', () => {
    const config = parseMailnaraConfig({
      mailImapHost: 'mail.brct.co.kr',
      mailImapPort: '993',
      mailImapSecure: 'true',
      mailImapUser: 'worker@example.com',
      mailImapPassword: 'secret',
      mailImapMailbox: 'INBOX',
    })

    assert.deepEqual(config, {
      host: 'mail.brct.co.kr',
      port: 993,
      secure: true,
      user: 'worker@example.com',
      password: 'secret',
      mailbox: 'INBOX',
    })
  })

  it('rejects missing credentials without including secret input', () => {
    assert.throws(() => parseMailnaraConfig({
      mailImapHost: 'mail.brct.co.kr',
      mailImapPort: '993',
      mailImapSecure: 'true',
      mailImapUser: '',
      mailImapPassword: 'do-not-print-me',
      mailImapMailbox: 'INBOX',
    }), /Mailnara IMAP configuration is invalid/)
  })
})

describe('mail identifiers', () => {
  it('round-trips UIDVALIDITY and UID', () => {
    const encoded = encodeMailId(1534771073n, 515)

    assert.deepEqual(decodeMailId(encoded), { uidValidity: 1534771073n, uid: 515 })
  })

  it('rejects untrusted identifiers', () => {
    assert.throws(() => decodeMailId('gmail-message-id'), /Invalid Mailnara message identifier/)
  })
})

describe('normalizeMailDate', () => {
  it('accepts RFC822 date strings returned by PostalMime', () => {
    assert.equal(
      normalizeMailDate('Tue, 21 Jul 2026 10:30:00 +0900')?.toISOString(),
      '2026-07-21T01:30:00.000Z',
    )
  })
})

describe('parseGmailQuery', () => {
  it('translates date and attachment filters', () => {
    assert.deepEqual(parseGmailQuery('after:1719792000 before:1722470400 has:attachment filename:pdf'), {
      after: new Date(1719792000 * 1000),
      before: new Date(1722470400 * 1000),
      hasAttachment: true,
      filename: 'pdf',
      text: [],
      from: undefined,
      subjects: [],
    })
  })

  it('translates sender, quoted BL text, and subject alternatives', () => {
    assert.deepEqual(parseGmailQuery('from:dhl "1234567890" subject:("이고요청e" OR "이고 요청e")'), {
      after: undefined,
      before: undefined,
      hasAttachment: false,
      filename: undefined,
      text: ['1234567890'],
      from: 'dhl',
      subjects: ['이고요청e', '이고 요청e'],
    })
  })
})
