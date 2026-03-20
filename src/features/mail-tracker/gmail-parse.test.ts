import { describe, it, expect } from 'vitest'
import { isReceivedOlderThanDays, sortMessagesOldestFirst } from './gmail-parse'
import type { GmailMessageSummary } from './types'

const m = (id: string, receivedAt: string): GmailMessageSummary => ({
  id,
  threadId: id,
  from: 'a@b',
  subject: 's',
  receivedAt,
  gmailWebUrl: 'https://mail.google.com/',
})

describe('gmail-parse', () => {
  it('古い順にソート', () => {
    const sorted = sortMessagesOldestFirst([m('2', '2025-03-02T00:00:00.000Z'), m('1', '2025-03-01T00:00:00.000Z')])
    expect(sorted[0].id).toBe('1')
  })
  it('1日以上前は滞留', () => {
    const old = '2020-01-01T00:00:00.000Z'
    expect(isReceivedOlderThanDays(old, 1, new Date('2025-03-20T12:00:00Z'))).toBe(true)
  })
  it('当日受信は滞留にしない', () => {
    const now = new Date('2025-03-20T12:00:00Z')
    expect(isReceivedOlderThanDays(now.toISOString(), 1, now)).toBe(false)
  })
})
