export default function ClientsListView({
  clients,
  remembers,
  onAddClient,
  onEditClient,
  onOpenClientDetail,
}) {
  if (clients.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🤝</div>
        <p>クライアントがありません</p>
        <p className="text-muted-13-mt8">
          取引先・担当先を追加すると、そのクライアントごとに「今後に向けて覚えておくこと」をメモできます。プロジェクトとは別で残ります。
        </p>
        <button type="button" className="btn btn-primary" onClick={onAddClient}>
          最初のクライアントを追加
        </button>
      </div>
    )
  }
  return (
    <div className="projects-grid clients-grid">
      {clients.map((c) => {
        const clientRemembers = remembers.filter((r) => r.clientId === c.id)
        return (
          <div
            key={c.id}
            className="task-card"
            style={{
              cursor: 'default',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '140px',
              background: `${c.color}28`,
              borderColor: `${c.color}60`,
            }}
          >
            <div
              className="remember-client-label"
              style={{
                background: `${c.color}22`,
                color: c.color,
                border: `2px solid ${c.color}66`,
              }}
            >
              <span className="remember-client-icon">{c.icon}</span>
              <span className="remember-client-name">{c.name}</span>
            </div>
            {clientRemembers.length === 0 ? (
              <p className="remember-empty">まだありません</p>
            ) : (
              <ul className="remember-list">
                {clientRemembers.map((r) => (
                  <li
                    key={r.id}
                    className="remember-item"
                    style={{ borderLeftColor: c.color }}
                  >
                    <span className="remember-icon" aria-hidden>
                      📌
                    </span>
                    <span className="remember-body">{r.body}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="card-footer card-footer-sep">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onEditClient(c)}
              >
                設定
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onOpenClientDetail(c.id)}
              >
                編集・追加
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
