import { isReceivedOlderThanDays } from './gmail-parse'
import type { GmailMessageSummary } from './types'

type Props = {
  loading: boolean
  items: GmailMessageSummary[]
  onRefresh: () => void
}

/** 未返信メール一覧（古い順・1日以上で強調） */
export function MailTrackerList({ loading, items, onRefresh }: Readonly<Props>) {
  return (
    <section className="mt-section" aria-labelledby="mt-heading">
      <div className="mt-toolbar">
        <h2 id="mt-heading" className="bf-heading">
          未返信メール
        </h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRefresh} disabled={loading}>
          {loading ? '更新中…' : '手動更新'}
        </button>
      </div>
      <p className="mt-count" aria-live="polite">
        未返信: <strong>{items.length}</strong> 件
      </p>
      {items.length === 0 && !loading ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>表示するメールがありません（トークン未設定か、該当なし）</p>
        </div>
      ) : (
        <div className="bf-table-wrap mt-table-wrap">
          <table className="bf-table">
            <thead>
              <tr>
                <th>受信日時</th>
                <th>送信者</th>
                <th>件名</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const stale = isReceivedOlderThanDays(row.receivedAt, 1)
                return (
                  <tr key={row.id} className={stale ? 'mt-row--stale' : undefined}>
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
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
