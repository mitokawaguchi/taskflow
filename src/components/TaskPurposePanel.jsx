/**
 * タスクカード上の「目的」表示（一覧・カンバンで見た目を揃える）
 */
export function TaskPurposePanel({ purpose, variant = 'list' }) {
  const text = typeof purpose === 'string' ? purpose.trim() : ''
  if (!text) return null

  const rootClass =
    variant === 'kanban' ? 'task-purpose-panel task-purpose-panel--kanban' : 'task-purpose-panel'

  return (
    <div className={rootClass} role="note" aria-label={`目的: ${text}`}>
      <div className="task-purpose-panel__head">
        <span className="task-purpose-panel__badge" aria-hidden>
          目的
        </span>
      </div>
      <p className="task-purpose-panel__body">{text}</p>
    </div>
  )
}
