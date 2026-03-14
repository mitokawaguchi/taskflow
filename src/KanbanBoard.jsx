import { useState, useCallback, useMemo, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  pointerWithin,
} from '@dnd-kit/core'
import { getPriorityLabel, TASK_STATUS, TASK_STATUS_KEYS, progressFromStatus, getCategoryInfo } from './constants'
import { formatDate, isOverdue } from './utils'

function KanbanCardContent({ task, projects, categories = [], users = [], projectsMap, usersMap }) {
  const proj = projectsMap?.get(task.projectId) ?? projects?.find(p => p.id === task.projectId)
  const progress = task.progress != null ? task.progress : progressFromStatus(task.status)
  const over = isOverdue(task.due)
  const categoryInfo = getCategoryInfo(task.category, categories)
  const assignee = task.assigneeId
    ? (usersMap?.get(task.assigneeId) ?? users?.find(u => u.id === task.assigneeId))
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
        {assignee && (
          <div className="kanban-card__assignee">
            {assignee.avatarUrl ? <img src={assignee.avatarUrl} alt="" width={14} height={14} style={{ borderRadius: '50%' }} /> : '👤'}
            <span>{assignee.name}</span>
          </div>
        )}
        <div className="kanban-card__progress">
          <div className="kanban-card__progress-bar" style={{ width: `${progress}%` }} />
          <span className="kanban-card__progress-text">{progress}%</span>
        </div>
        <div className="kanban-card__footer">
          {task.due && (
            <span className={`kanban-card__due ${over ? 'overdue' : ''}`}>
              📅 {formatDate(task.due)}
            </span>
          )}
          <span className={`priority-badge ${task.priority}`}>{getPriorityLabel(task.priority)}</span>
        </div>
      </div>
    </>
  )
}

function KanbanCard({ task, projects, categories = [], users = [], projectsMap, usersMap, onClick, isOverlay }) {
  const content = (
    <KanbanCardContent
      task={task}
      projects={projects}
      categories={categories}
      users={users}
      projectsMap={projectsMap}
      usersMap={usersMap}
    />
  )

  if (isOverlay) {
    return <div className="kanban-card kanban-card--overlay">{content}</div>
  }

  return (
    <div className="kanban-card" onClick={() => onClick(task)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick(task)}>
      {content}
    </div>
  )
}

function DraggableKanbanCard({ task, projects, categories = [], users = [], projectsMap, usersMap, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  return (
    <div
      ref={setNodeRef}
      className={`kanban-card kanban-card--draggable ${isDragging ? 'kanban-card--dragging' : ''}`}
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
        onClick={e => { e.stopPropagation(); onClick(task) }}
        onKeyDown={e => e.key === 'Enter' && onClick(task)}
        role="button"
        tabIndex={0}
      >
        <KanbanCardContent task={task} projects={projects} categories={categories} users={users} projectsMap={projectsMap} usersMap={usersMap} />
      </div>
    </div>
  )
}

function DroppableColumn({ id, title, count, children, onAddTask }) {
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
      <div className="kanban-column__cards">
        {children}
      </div>
      <button
        type="button"
        className="kanban-column__add"
        onClick={() => onAddTask(id)}
      >
        ＋ タスクを追加
      </button>
    </div>
  )
}

export default function KanbanBoard({ tasks, projects, categories = [], users = [], projectsMap, usersMap, onMoveTask, onEditTask, onAddTask }) {
  const dragProcessedRef = useRef(null)

  const columns = useMemo(() => {
    const map = { todo: [], in_progress: [], review: [], done: [] }
    for (const t of tasks) {
      const s = TASK_STATUS_KEYS.includes(t.status) ? t.status : (t.done ? 'done' : 'todo')
      if (map[s]) map[s].push(t)
    }
    return map
  }, [tasks])

  const handleDragEnd = useCallback(
    event => {
      const { active, over } = event
      if (!over) {
        dragProcessedRef.current = null
        return
      }
      const taskId = active.id
      // 同一ドラッグで onMoveTask が二重に呼ばれて重複更新されないよう1回だけ処理
      if (dragProcessedRef.current === taskId) return
      dragProcessedRef.current = taskId
      setTimeout(() => { dragProcessedRef.current = null }, 300)

      let targetStatus = null
      if (TASK_STATUS_KEYS.includes(over.id)) {
        targetStatus = over.id
      } else {
        const task = tasks.find(t => t.id === over.id)
        if (task) targetStatus = task.status
      }
      if (targetStatus && tasks.find(t => t.id === taskId)?.status !== targetStatus) {
        onMoveTask(taskId, targetStatus)
      }
    },
    [tasks, onMoveTask]
  )

  const [activeId, setActiveId] = useState(null)
  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={e => setActiveId(e.active.id)}
      onDragEnd={e => { handleDragEnd(e); setActiveId(null) }}
    >
      <div className="kanban-board">
        {TASK_STATUS_KEYS.map(key => (
          <DroppableColumn
            key={key}
            id={key}
            title={TASK_STATUS[key].label}
            count={columns[key].length}
            onAddTask={onAddTask}
          >
            {columns[key].map(t => (
              <DraggableKanbanCard
                key={t.id}
                task={t}
                projects={projects}
                categories={categories}
                users={users}
                projectsMap={projectsMap}
                usersMap={usersMap}
                onClick={onEditTask}
              />
            ))}
          </DroppableColumn>
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <KanbanCard
            task={activeTask}
            projects={projects}
            categories={categories}
            users={users}
            projectsMap={projectsMap}
            usersMap={usersMap}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

