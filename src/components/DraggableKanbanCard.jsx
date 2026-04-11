import { useDraggable } from '@dnd-kit/core'
import { normalizeTaskStatus } from '../constants'
import { KanbanCardContent } from './KanbanCardContent'

export function DraggableKanbanCard({
  task,
  projects,
  categories = [],
  users = [],
  projectsMap,
  usersMap,
  onClick,
  onToggleDone,
  tasksById,
  onPatchTask,
  onScrollToTask,
  isHighlighted,
}) {
  const priorityClass = task.priority ?? 'medium'
  const statusClass = `kanban-card--status-${normalizeTaskStatus(task)}`
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  return (
    <div
      ref={setNodeRef}
      data-kanban-task-id={task.id}
      className={`kanban-card kanban-card--draggable ${priorityClass} ${statusClass} ${isDragging ? 'kanban-card--dragging' : ''} ${isHighlighted ? 'kanban-card--highlight' : ''}`}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
    >
      <span
        className="kanban-card__drag-handle"
        {...listeners}
        {...attributes}
        aria-label="ドラッグで列を移動"
        title="ドラッグで移動"
      >
        ⋮⋮
      </span>
      <div
        className="kanban-card__clickable"
        onClick={(e) => {
          e.stopPropagation()
          onClick(task)
        }}
        onKeyDown={(e) => e.key === 'Enter' && onClick(task)}
        role="button"
        tabIndex={0}
      >
        <KanbanCardContent
          task={task}
          projects={projects}
          categories={categories}
          users={users}
          projectsMap={projectsMap}
          usersMap={usersMap}
          onToggleDone={onToggleDone}
          tasksById={tasksById}
          onPatchTask={onPatchTask}
          onScrollToTask={onScrollToTask}
        />
      </div>
    </div>
  )
}
