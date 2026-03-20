import { isReceivedOlderThanDays } from './gmail-parse'
import type { InboxTab, UnifiedInboxRow } from './chatwork-unread-types'

type Props = {
  tab: InboxTab
  onTabChange: (t: InboxTab) => void
  rows: UnifiedInboxRow[]
  counts: { mail: number; chatwork: number }
  loadingMail: boolean
  loadingChatwork: boolean
  onRefresh: () => void
}

const tabBtn = (active: boolean) =>
  `btn btn-sm ${active ? 'btn-primary' : 'btn-ghost'}`

function emptyInboxMessage(tab: InboxTab): string {
  if (tab === 'mail') return '表示するメールがありません（Gmail トークン未設定か、該当なし）'
  if (tab === 'chatwork') {
    return 'Chatwork の未返信はありません（Edge の Secrets またはログインを確認）'
  }
  return '該当する未返信はありません'
}

/** 未返信一覧（メール + Chatwork、古い順） */
export function MailTrackerList({
  tab,
  onTabChange,
  rows,
  counts,
  loadingMail,
  loadingChatwork,
  onRefresh,
}: Readonly<Props>) {
  const busy = loadingMail || loadingChatwork
  const total = counts.mail + counts.chatwork

  return (
    <section className="mt-section" aria-labelledby="mt-heading">
      <div className="mt-toolbar">
        <h2 id="mt-heading" className="bf-heading">
          未返信（メール・Chatwork）
        </h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRefresh} disabled={busy}>
          {busy ? '更新中…' : '手動更新'}
        </button>
      </div>
      <div className="mt-tabs" role="tablist" aria-label="表示切替">
        <button type="button" className={tabBtn(tab === 'all')} onClick={() => onTabChange('all')}>
          すべて
        </button>
        <button type="button" className={tabBtn(tab === 'mail')} onClick={() => onTabChange('mail')}>
          メール ({counts.mail})
        </button>
        <button
          type="button"
          className={tabBtn(tab === 'chatwork')}
          onClick={() => onTabChange('chatwork')}
        >
          Chatwork ({counts.chatwork})
        </button>
      </div>
      <p className="mt-count" aria-live="polite">
        表示中: <strong>{rows.length}</strong> 件（合計 {total}：メール {counts.mail} / Chatwork{' '}
        {counts.chatwork}）
      </p>
      {rows.length === 0 && !busy ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>{emptyInboxMessage(tab)}</p>
        </div>
      ) : (
        <div className="bf-table-wrap mt-table-wrap">
          <table className="bf-table">
            <thead>
              <tr>
                <th>種類</th>
                <th>受信日時</th>
                <th>送信者</th>
                <th>件名 / プレビュー</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const stale = isReceivedOlderThanDays(row.receivedAt, 1)
                if (row.kind === 'mail') {
                  return (
                    <tr key={row.id} className={stale ? 'mt-row--stale' : undefined}>
                      <td>メール</td>
                      <td>{row.receivedAt.slice(0, 16).replace('T', ' ')}</td>
                      <td className="mt-cell-from">{row.from}</td>
                      <td>
                        <a
                          href={row.gmailWebUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-link"
                        >
                          {row.subject || '（件名なし）'}
                        </a>
                      </td>
                    </tr>
                  )
                }
                return (
                  <tr key={row.id} className={stale ? 'mt-row--stale' : undefined}>
                    <td>Chatwork</td>
                    <td>{row.receivedAt.slice(0, 16).replace('T', ' ')}</td>
                    <td className="mt-cell-from">{row.from}</td>
                    <td>
                      <a
                        href={row.openUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-link"
                      >
                        {row.roomName} — {row.preview || '（本文なし）'}
                      </a>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
