import { getPriorityLabel } from '../constants'

export default function TemplatesListView({
  templates,
  onAddTemplate,
  onEditTemplate,
  onUseTemplate,
}) {
  if (templates.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <p>テンプレートがありません</p>
        <button type="button" className="btn btn-primary" onClick={onAddTemplate}>
          最初のテンプレートを作成
        </button>
      </div>
    )
  }
  return (
    <div className="cards-grid">
      {templates.map((t) => (
        <div key={t.id} className="task-card medium">
          <div className="card-header">
            <div className="card-title">{t.title}</div>
          </div>
          {t.desc && <div className="card-desc">{t.desc}</div>}
          <div className="card-footer">
            <span className={`priority-badge ${t.priority}`}>
              {getPriorityLabel(t.priority)}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onEditTemplate(t)}
            >
              編集
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm ml-auto"
              onClick={onUseTemplate}
            >
              このテンプレを使う
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
