import { KanbanCardContent } from './KanbanCardContent'

export function KanbanCard({ task, projects, categories = [], users = [], projectsMap, usersMap, onClick, isOverlay, onToggleDone }) {
  const content = (
    <KanbanCardContent
      task={task}
      projects={projects}
      categories={categories}
      users={users}
      projectsMap={projectsMap}
      usersMap={usersMap}
      onToggleDone={onToggleDone}
    />
  )

  if (isOverlay) {
    return <div className="kanban-card kanban-card--overlay">{content}</div>
  }

  return (
    <div
      className="kanban-card"
      onClick={() => onClick(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(task)}
    >
      {content}
    </div>
  )
}
