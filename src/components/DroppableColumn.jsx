import { useDroppable } from '@dnd-kit/core'

export function DroppableColumn({ id, title, count, children, onAddTask }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? 'kanban-column--over' : ''}`}
      data-status={id}
    >
      <div className="kanban-column__header">
        <span className="kanban-column__title">{title}</span>
        <span className="kanban-column__badge">{count}</span>
      </div>
      <div className="kanban-column__cards">{children}</div>
      <button type="button" className="kanban-column__add" onClick={() => onAddTask(id)}>
        ＋ タスクを追加
      </button>
    </div>
  )
}
