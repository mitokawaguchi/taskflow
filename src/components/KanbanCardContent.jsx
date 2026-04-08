import { getPriorityLabel, progressFromStatus, getCategoryInfo, getStatusLabel, normalizeTaskStatus } from '../constants'
import { formatDate, isOverdue } from '../utils'

export function KanbanCardContent({ task, projects, categories = [], users = [], projectsMap, usersMap, onToggleDone }) {
  const proj = projectsMap?.get(task.projectId) ?? projects?.find((p) => p.id === task.projectId)
  const statusKey = normalizeTaskStatus(task)
  const progress = task.progress != null ? task.progress : progressFromStatus(statusKey)
  const over = isOverdue(task.due)
  const categoryInfo = getCategoryInfo(task.category, categories)
  const assignee = task.assigneeId
    ? (usersMap?.get(task.assigneeId) ?? users?.find((u) => u.id === task.assigneeId))
    : null

  return (
    <>
      <div className={`kanban-card__bar kanban-card__bar--${task.priority}`} />
      <div className="kanban-card__body">
        <div className="kanban-card__title-row">
          <input
            type="checkbox"
            className="kanban-card__check"
            checked={!!task.done}
            onChange={(e) => {
              e.stopPropagation()
              onToggleDone?.(task.id)
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label={`${task.title}を${task.done ? '未完了に' : '完了に'}する`}
          />
          <div className="kanban-card__title-with-priority">
            <div className={`kanban-card__title ${task.done ? 'done' : ''}`}>{task.title}</div>
            <span className={`priority-badge ${task.priority}`}>{getPriorityLabel(task.priority)}</span>
          </div>
        </div>
        <div className="kanban-card__meta-row">
          <span
            className={`status-badge status-badge--${statusKey}`}
            title={`状態: ${getStatusLabel(statusKey)}`}
          >
            {getStatusLabel(statusKey)}
          </span>
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
        </div>
        <div className="kanban-card__progress">
          <div className="kanban-card__progress-bar" style={{ width: `${progress}%` }} />
          <span className="kanban-card__progress-text">{progress}%</span>
        </div>
        <div className="kanban-card__footer">
          {task.due && (
            <span className={`kanban-card__due ${over ? 'overdue' : ''}`}>📅 {formatDate(task.due)}</span>
          )}
          {assignee && (
            <span className="kanban-card__assignee-inline" title={assignee.name} aria-label={`担当: ${assignee.name}`}>
              {assignee.avatarUrl ? (
                <img src={assignee.avatarUrl} alt="" width={16} height={16} className="kanban-card__assignee-inline-img" />
              ) : (
                <span className="kanban-card__assignee-inline-dot" aria-hidden>👤</span>
              )}
            </span>
          )}
        </div>
      </div>
    </>
  )
}
