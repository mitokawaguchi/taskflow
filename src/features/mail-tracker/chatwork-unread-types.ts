import type { GmailMessageSummary } from './types'

/** 受信箱タブ（メール / Chatwork / 両方） */
export type InboxTab = 'all' | 'mail' | 'chatwork'

export type ChatworkUnreadRow = {
  kind: 'chatwork'
  id: string
  roomId: string
  roomName: string
  from: string
  preview: string
  receivedAt: string
  openUrl: string
}

export type MailInboxRow = GmailMessageSummary & { kind: 'mail' }

export type UnifiedInboxRow = MailInboxRow | ChatworkUnreadRow
