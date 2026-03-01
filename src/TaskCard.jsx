import { PRIORITY } from './constants'
import { isOverdue, isToday, formatDate } from './utils'

export default function TaskCard({ task, projects, onToggle, onClick }) {
  const proj = projects.find(p => p.id === task.projectId)
  const over = isOverdue(task.due)
  const tod  = isToday(task.due)

  return (
    <div className={`task-card ${task.priority} ${task.done ? 'done' : ''}`} onClick={onClick}>
      {proj && (
        <div className="card-project-banner" style={{ background: `${proj.color}28`, color: proj.color, border: `1px solid ${proj.color}55` }}>
          <span>{proj.icon}</span>
          <span>{proj.name}</span>
        </div>
      )}
      <div className="card-header">
        <div
          className={`card-check ${task.done ? 'checked' : ''}`}
          onClick={e => { e.stopPropagation(); onToggle(task.id) }}
        />
        <div className={`card-title ${task.done ? 'done' : ''}`}>{task.title}</div>
      </div>
      {task.desc && <div className="card-desc">{task.desc}</div>}
      <div className="card-footer">
        <span className={`priority-badge ${task.priority}`}>{PRIORITY[task.priority].label}</span>
        {task.due && (
          <span className={`due-badge ${over ? 'overdue' : tod ? 'today' : ''}`} style={{ marginLeft: 'auto' }}>
            📅 {formatDate(task.due)}
          </span>
        )}
      </div>
    </div>
  )
}
