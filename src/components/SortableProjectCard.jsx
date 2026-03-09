import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { endDateLabel } from '../utils'

/**
 * ドラッグ可能なプロジェクトカード（プロジェクト一覧の並び替え用）
 */
export default function SortableProjectCard({ item, setView, toggleTask, openTaskFormForProject }) {
  const { project: p, ptasks, pct } = item
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: p.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    background: `${p.color}28`,
    border: `1px solid ${p.color}60`,
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`project-card ${isDragging ? 'project-card-dragging' : ''}`}
    >
      <div className="project-card-header">
        <span
          className="project-card-drag-handle"
          {...attributes}
          {...listeners}
          aria-label="並び順を変える"
          title="ドラッグで並び替え"
        >
          ⋮⋮
        </span>
        <button
          type="button"
          className="project-card-clickable"
          onClick={() => setView(`p:${p.id}`)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: 'none',
            background: 'none',
            padding: 0,
            font: 'inherit',
            color: 'inherit',
            cursor: 'pointer',
            textAlign: 'left',
            minWidth: 0,
          }}
        >
          <div className="project-icon" style={{ background: `${p.color}20` }}>
            {p.icon}
          </div>
          <div>
            <div className="project-name">{p.name}</div>
            <div className="project-count">
              {ptasks.filter((t) => !t.done).length} 件残り
              {p.endDate && <span className="project-due"> · {endDateLabel(p.endDate)}</span>}
            </div>
          </div>
        </button>
      </div>
      <button
        type="button"
        className="project-progress"
        onClick={() => setView(`p:${p.id}`)}
        aria-label={`${p.name}の進捗`}
        style={{ width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div className="project-progress-fill" style={{ width: `${pct}%`, background: p.color }} />
      </button>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{pct}% 完了</div>
      <ul className="project-card-tasks" aria-label={`${p.name}のタスク`}>
        {ptasks.map((t) => (
          <li key={t.id} className={`project-task-row project-task-row--${t.priority}`}>
            <input
              type="checkbox"
              className="project-task-check"
              checked={!!t.done}
              onChange={() => toggleTask(t.id)}
              aria-label={`${t.title}を${t.done ? '未完了に' : '完了に'}`}
            />
            <span className={`project-task-title ${t.done ? 'done' : ''}`}>{t.title}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="btn btn-ghost btn-sm project-card-add-task"
        onClick={(e) => {
          e.stopPropagation()
          openTaskFormForProject(p.id)
        }}
      >
        ＋ タスクを追加
      </button>
    </div>
  )
}
