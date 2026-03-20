import type { GmailMessageSummary } from './types'
import type { ChatworkUnreadRow, InboxTab, MailInboxRow, UnifiedInboxRow } from './chatwork-unread-types'

export function toMailRows(items: GmailMessageSummary[]): MailInboxRow[] {
  return items.map((m) => ({ ...m, kind: 'mail' as const }))
}

export function mergeInboxRowsOldestFirst(
  mail: GmailMessageSummary[],
  chatwork: ChatworkUnreadRow[],
): UnifiedInboxRow[] {
  const m = toMailRows(mail)
  const merged: UnifiedInboxRow[] = [...m, ...chatwork]
  merged.sort((a, b) => a.receivedAt.localeCompare(b.receivedAt))
  return merged
}

export function filterByTab(rows: UnifiedInboxRow[], tab: InboxTab): UnifiedInboxRow[] {
  if (tab === 'all') return rows
  if (tab === 'mail') return rows.filter((r) => r.kind === 'mail')
  return rows.filter((r) => r.kind === 'chatwork')
}
