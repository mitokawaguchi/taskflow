import { useDroppable, useDraggable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import TaskCard from '../../TaskCard'
import { poolDragId } from './applyPlannerDrag'

export function SortableRow({ id, task, projects, categories, users, projectsMap, usersMap, onToggle, onEdit, label }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="daily-planner__rank-row"
      {...listeners}
      {...attributes}
    >
      <span className="daily-planner__rank-label">{label}</span>
      <div className="daily-planner__card-wrap">
        <TaskCard
          task={task}
          projects={projects}
          categories={categories}
          users={users}
          projectsMap={projectsMap}
          usersMap={usersMap}
          onToggle={onToggle}
          onClick={() => onEdit(task)}
        />
      </div>
    </div>
  )
}

export function PoolDraggable({ task, projects, categories, users, projectsMap, usersMap, onToggle, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: poolDragId(task.id) })
  const style = transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` } : undefined
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`daily-planner__pool-card ${isDragging ? 'daily-planner__pool-card--drag' : ''}`}
      {...listeners}
      {...attributes}
    >
      <TaskCard
        task={task}
        projects={projects}
        categories={categories}
        users={users}
        projectsMap={projectsMap}
        usersMap={usersMap}
        onToggle={onToggle}
        onClick={() => onEdit(task)}
      />
    </div>
  )
}

export function DropColumn({ zoneId, title, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: zoneId })
  return (
    <div ref={setNodeRef} className={`daily-planner__col ${isOver ? 'daily-planner__col--over' : ''}`}>
      <h3 className="daily-planner__col-title">{title}</h3>
      {children}
    </div>
  )
}

export function PoolDropZone({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`daily-planner__pool-drop ${id === 'pool-zone-top' ? 'daily-planner__pool-drop--top' : 'daily-planner__pool-drop--bottom'} ${isOver ? 'daily-planner__pool-drop--over' : ''}`}
    >
      {children}
    </div>
  )
}
