/**
 * Chatwork 未返信判定（同一ルーム内で、自分宛 To メンションに対し自分の返信がまだ無い最古の1件）。
 * SYNC: src/features/mail-tracker/chatwork-unread-logic.ts と同一ロジックを維持すること。
 */
export type CwMessageLike = {
  message_id: string
  body: string
  send_time: number
  account: { account_id: number; name: string }
}

export function bodyHasToMention(body: string, myAccountId: number): boolean {
  const needle = `[To:${myAccountId}]`
  const lower = body.toLowerCase()
  return body.includes(needle) || lower.includes(needle.toLowerCase())
}

export function pickOldestUnansweredMention(
  messages: CwMessageLike[],
  myAccountId: number,
): { from: string; preview: string; sendAtSec: number } | null {
  if (messages.length === 0) return null
  const sorted = [...messages].sort((a, b) => a.send_time - b.send_time)
  const unanswered: CwMessageLike[] = []
  for (const m of sorted) {
    if (m.account.account_id === myAccountId) continue
    if (!bodyHasToMention(m.body, myAccountId)) continue
    const hasReplyAfter = sorted.some(
      (x) => x.account.account_id === myAccountId && x.send_time > m.send_time,
    )
    if (!hasReplyAfter) unanswered.push(m)
  }
  if (unanswered.length === 0) return null
  const oldest = unanswered.reduce((a, b) => (a.send_time < b.send_time ? a : b))
  return {
    from: oldest.account.name,
    preview: oldest.body.slice(0, 120),
    sendAtSec: oldest.send_time,
  }
}
