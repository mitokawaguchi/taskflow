import { describe, expect, it } from 'vitest'
import { filterByTab, mergeInboxRowsOldestFirst, toMailRows } from './inbox-merge'

const mail = {
  id: 'm1',
  threadId: 't',
  from: 'a@b',
  subject: 'S',
  receivedAt: '2025-03-02T00:00:00.000Z',
  gmailWebUrl: 'https://mail.google.com/',
}

const cw = {
  kind: 'chatwork' as const,
  id: 'cw-1',
  roomId: '1',
  roomName: 'R',
  from: 'X',
  preview: 'p',
  receivedAt: '2025-03-01T00:00:00.000Z',
  openUrl: 'https://www.chatwork.com/#!rid1',
}

describe('inbox-merge', () => {
  it('toMailRows で kind が付く', () => {
    const rows = toMailRows([mail])
    expect(rows[0]?.kind).toBe('mail')
  })

  it('mergeInboxRowsOldestFirst は受信日時でソート', () => {
    const merged = mergeInboxRowsOldestFirst([mail], [cw])
    expect(merged[0]?.kind).toBe('chatwork')
    expect(merged[1]?.kind).toBe('mail')
  })

  it('filterByTab', () => {
    const merged = mergeInboxRowsOldestFirst([mail], [cw])
    expect(filterByTab(merged, 'mail').length).toBe(1)
    expect(filterByTab(merged, 'chatwork').length).toBe(1)
    expect(filterByTab(merged, 'all').length).toBe(2)
  })
})
