import { getPriorityLabel, progressFromStatus, getCategoryInfo } from '../constants'
import { formatDate, isOverdue } from '../utils'

export function KanbanCardContent({ task, projects, categories = [], users = [], projectsMap, usersMap }) {
  const proj = projectsMap?.get(task.projectId) ?? projects?.find((p) => p.id === task.projectId)
  const progress = task.progress != null ? task.progress : progressFromStatus(task.status)
  const over = isOverdue(task.due)
  const categoryInfo = getCategoryInfo(task.category, categories)
  const assignee = task.assigneeId
    ? (usersMap?.get(task.assigneeId) ?? users?.find((u) => u.id === task.assigneeId))
    : null

  return (
    <>
      <div className={`kanban-card__bar kanban-card__bar--${task.priority}`} />
      <div className="kanban-card__body">
        <div className="kanban-card__title">{task.title}</div>
        {categoryInfo && (
          <span
            className="kanban-card__category"
            style={{
              background: `${categoryInfo.color}20`,
              color: categoryInfo.color,
            }}
          >
            {categoryInfo.label}
          </span>
        )}
        {proj && (
          <div className="kanban-card__meta" style={{ color: proj.color }}>
            {proj.icon} {proj.name}
          </div>
        )}
        <div className="kanban-card__assignee-slot" title={assignee ? assignee.name : ''}>
          {assignee ? (
            <>
              {assignee.avatarUrl ? (
                <img src={assignee.avatarUrl} alt="" width={14} height={14} className="kanban-card__assignee-avatar" />
              ) : (
                <span className="kanban-card__assignee-icon" aria-hidden>👤</span>
              )}
              <span className="kanban-card__assignee-name">{assignee.name}</span>
            </>
          ) : null}
        </div>
        <div className="kanban-card__progress">
          <div className="kanban-card__progress-bar" style={{ width: `${progress}%` }} />
          <span className="kanban-card__progress-text">{progress}%</span>
        </div>
        <div className="kanban-card__footer">
          {task.due && (
            <span className={`kanban-card__due ${over ? 'overdue' : ''}`}>📅 {formatDate(task.due)}</span>
          )}
          <span className={`priority-badge ${task.priority}`}>{getPriorityLabel(task.priority)}</span>
        </div>
      </div>
    </>
  )
}
