import { getPriorityLabel, getCategoryInfo, getStatusLabel, normalizeTaskStatus } from './constants'
import { isOverdue, isToday, isTomorrow, formatDate } from './utils'

export default function TaskCard({ task, projects, categories = [], users = [], projectsMap, usersMap, onToggle, onClick }) {
  const statusKey = normalizeTaskStatus(task)
  const categoryInfo = getCategoryInfo(task.category, categories)
  const proj = projectsMap ? projectsMap.get(task.projectId) : (projects || []).find(p => p.id === task.projectId)
  const assignee = task.assigneeId ? (usersMap ? usersMap.get(task.assigneeId) : (users || []).find(u => u.id === task.assigneeId)) : null
  const over = isOverdue(task.due)
  const tod  = isToday(task.due)
  const tom  = isTomorrow(task.due)

  return (
    <div className={`task-card ${task.priority} ${task.done ? 'done' : ''}`} onClick={onClick}>
      {proj && (
        <div className="card-project-banner" style={{ background: `${proj.color}28`, color: proj.color, border: `1px solid ${proj.color}55` }}>
          <span>{proj.icon}</span>
          <span>{proj.name}</span>
        </div>
      )}
      <div className="card-header">
        <input
          type="checkbox"
          className={`card-check ${task.done ? 'checked' : ''}`}
          checked={!!task.done}
          onChange={e => { e.stopPropagation(); onToggle(task.id) }}
          onClick={e => e.stopPropagation()}
          aria-label={`${task.title}を${task.done ? '未完了に' : '完了に'}する`}
        />
        <div className="card-title-row">
          <div className={`card-title ${task.done ? 'done' : ''}`}>{task.title}</div>
          <span className={`priority-badge ${task.priority}`}>{getPriorityLabel(task.priority)}</span>
        </div>
      </div>
      {task.desc && <div className="card-desc">{task.desc}</div>}
      <div className="card-footer">
        <span
          className={`status-badge status-badge--${statusKey}`}
          title={`状態: ${getStatusLabel(statusKey)}`}
        >
          {getStatusLabel(statusKey)}
        </span>
        {categoryInfo && (
          <span
            className="category-badge"
            style={{
              background: `${categoryInfo.color}20`,
              color: categoryInfo.color,
              border: `1px solid ${categoryInfo.color}40`,
            }}
          >
            {categoryInfo.label}
          </span>
        )}
        {(task.due || assignee) && (
          <div className="card-footer__due-row">
            {task.due && (
              <span className={`due-badge ${over ? 'overdue' : tod || tom ? 'today-or-tomorrow' : ''}`}>
                {formatDate(task.due)}
              </span>
            )}
            {assignee && (
              <span className="card-assignee-inline" title={assignee.name} aria-label={`担当: ${assignee.name}`}>
                {assignee.avatarUrl ? (
                  <img src={assignee.avatarUrl} alt="" width={18} height={18} className="card-assignee-inline__img" />
                ) : (
                  <span className="card-assignee-inline__dot" aria-hidden>👤</span>
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
