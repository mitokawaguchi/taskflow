/** Gmail 一覧表示用の最小情報 */
export type GmailMessageSummary = {
  id: string
  threadId: string
  from: string
  subject: string
  receivedAt: string
  gmailWebUrl: string
}
