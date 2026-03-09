import { PRIORITY, getCategoryInfo } from './constants'
import { isOverdue, isToday, isTomorrow, formatDate } from './utils'

export default function TaskCard({ task, projects, categories = [], users = [], projectsMap, usersMap, onToggle, onClick }) {
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
        <div className={`card-title ${task.done ? 'done' : ''}`}>{task.title}</div>
      </div>
      {task.desc && <div className="card-desc">{task.desc}</div>}
      <div className="card-footer">
        {assignee && (
          <span className="card-assignee" title={assignee.name}>
            {assignee.avatarUrl ? <img src={assignee.avatarUrl} alt="" width={16} height={16} className="card-assignee-avatar" /> : '👤'}
            <span>{assignee.name}</span>
          </span>
        )}
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
        <span className={`priority-badge ${task.priority}`}>{PRIORITY[task.priority]?.label ?? task.priority}</span>
        {task.due && (
          <span className={`due-badge ${over ? 'overdue' : tod || tom ? 'today-or-tomorrow' : ''}`} style={{ marginLeft: 'auto' }}>
            {formatDate(task.due)}
          </span>
        )}
      </div>
    </div>
  )
}
