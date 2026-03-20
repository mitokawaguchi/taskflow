import type { GmailMessageSummary } from './types'

/** 受信日時が古い順（返信優先度が高い＝上に来る） */
export function sortMessagesOldestFirst(items: GmailMessageSummary[]): GmailMessageSummary[] {
  return [...items].sort((a, b) => a.receivedAt.localeCompare(b.receivedAt))
}

/** 指定日数以上前の受信なら「滞留」扱い（UI ハイライト用） */
export function isReceivedOlderThanDays(receivedIso: string, days: number, now: Date = new Date()): boolean {
  const t = Date.parse(receivedIso)
  if (Number.isNaN(t)) return false
  const threshold = now.getTime() - days * 86400000
  return t < threshold
}
