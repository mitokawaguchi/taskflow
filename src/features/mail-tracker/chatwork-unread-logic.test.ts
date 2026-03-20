import { describe, expect, it } from 'vitest'
import { bodyHasToMention, pickOldestUnansweredMention, type CwMessageLike } from './chatwork-unread-logic'

describe('bodyHasToMention', () => {
  it('自分宛 To を検出する', () => {
    expect(bodyHasToMention('[To:99]hello', 99)).toBe(true)
    expect(bodyHasToMention('[to:99]hello', 99)).toBe(true)
  })

  it('他人宛は false', () => {
    expect(bodyHasToMention('[To:1]hello', 99)).toBe(false)
  })
})

describe('pickOldestUnansweredMention', () => {
  const base = (over: Partial<CwMessageLike>): CwMessageLike => ({
    message_id: 'm1',
    body: '[To:10]yo',
    send_time: 100,
    account: { account_id: 2, name: 'A' },
    ...over,
  })

  it('自分が後から返信していれば未返信ではない', () => {
    const msgs: CwMessageLike[] = [
      base({ message_id: 'a', send_time: 100, body: '[To:10]need', account: { account_id: 2, name: 'B' } }),
      base({
        message_id: 'b',
        send_time: 200,
        body: 'reply',
        account: { account_id: 10, name: 'me' },
      }),
    ]
    expect(pickOldestUnansweredMention(msgs, 10)).toBeNull()
  })

  it('未返信の To があるとき最古の1件を返す', () => {
    const msgs: CwMessageLike[] = [
      base({
        message_id: 'a',
        send_time: 300,
        body: '[To:10]new',
        account: { account_id: 2, name: 'B' },
      }),
      base({
        message_id: 'b',
        send_time: 100,
        body: '[To:10]old',
        account: { account_id: 3, name: 'C' },
      }),
    ]
    const r = pickOldestUnansweredMention(msgs, 10)
    expect(r).not.toBeNull()
    expect(r?.sendAtSec).toBe(100)
    expect(r?.from).toBe('C')
  })
})
