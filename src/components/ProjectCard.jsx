import { endDateLabel } from '../utils'

/** プロジェクトカード（進捗・タスク一覧・追加ボタン）。ARCH-001 */
export default function ProjectCard({ project: p, ptasks, pct, onViewProject, onToggleTask, onAddTask }) {
  return (
    <div
      className="project-card"
      style={{ background: `${p.color}28`, border: `1px solid ${p.color}60` }}
    >
      <button
        type="button"
        className="project-card-header project-card-clickable"
        onClick={() => onViewProject(p.id)}
      >
        <div className="project-icon" style={{ background: `${p.color}20` }}>{p.icon}</div>
        <div>
          <div className="project-name">{p.name}</div>
          <div className="project-count">
            {ptasks.filter((t) => !t.done).length} 件残り
            {p.endDate && <span className="project-due"> · {endDateLabel(p.endDate)}</span>}
          </div>
        </div>
      </button>
      <div className="project-progress" onClick={() => onViewProject(p.id)}>
        <div className="project-progress-fill" style={{ width: `${pct}%`, background: p.color }} />
      </div>
      <div className="project-pct-label">{pct}% 完了</div>
      <ul className="project-card-tasks" aria-label={`${p.name}のタスク`}>
        {ptasks.map((t) => (
          <li key={t.id} className={`project-task-row project-task-row--${t.priority}`}>
            <input
              type="checkbox"
              className="project-task-check"
              checked={!!t.done}
              onChange={() => onToggleTask(t.id)}
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
          onAddTask(p.id)
        }}
      >
        ＋ タスクを追加
      </button>
    </div>
  )
}
