import { useState, useCallback, useMemo, useRef } from 'react'
import { DndContext, DragOverlay, pointerWithin } from '@dnd-kit/core'
import { TASK_STATUS, TASK_STATUS_KEYS } from './constants'
import { DroppableColumn } from './components/DroppableColumn'
import { DraggableKanbanCard } from './components/DraggableKanbanCard'
import { KanbanCard } from './components/KanbanCard'

export default function KanbanBoard({
  tasks,
  projects,
  categories = [],
  users = [],
  projectsMap,
  usersMap,
  onMoveTask,
  onEditTask,
  onAddTask,
  onToggleTask,
}) {
  const dragProcessedRef = useRef(null)

  const columns = useMemo(() => {
    const map = { todo: [], in_progress: [], review: [], done: [] }
    for (const t of tasks) {
      const s = TASK_STATUS_KEYS.includes(t.status) ? t.status : t.done ? 'done' : 'todo'
      if (map[s]) map[s].push(t)
    }
    return map
  }, [tasks])

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event
      if (!over) {
        dragProcessedRef.current = null
        return
      }
      const taskId = active.id
      if (dragProcessedRef.current === taskId) return
      dragProcessedRef.current = taskId
      setTimeout(() => {
        dragProcessedRef.current = null
      }, 300)

      let targetStatus = null
      if (TASK_STATUS_KEYS.includes(over.id)) {
        targetStatus = over.id
      } else {
        const task = tasks.find((t) => t.id === over.id)
        if (task) targetStatus = task.status
      }
      if (targetStatus && tasks.find((t) => t.id === taskId)?.status !== targetStatus) {
        onMoveTask(taskId, targetStatus)
      }
    },
    [tasks, onMoveTask]
  )

  const [activeId, setActiveId] = useState(null)
  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={(e) => setActiveId(e.active.id)}
      onDragEnd={(e) => {
        handleDragEnd(e)
        setActiveId(null)
      }}
    >
      <div className="kanban-board">
        {TASK_STATUS_KEYS.map((key) => (
          <DroppableColumn
            key={key}
            id={key}
            title={TASK_STATUS[key].label}
            count={columns[key].length}
            onAddTask={onAddTask}
          >
            {columns[key].map((t) => (
              <DraggableKanbanCard
                key={t.id}
                task={t}
                projects={projects}
                categories={categories}
                users={users}
                projectsMap={projectsMap}
                usersMap={usersMap}
                onClick={onEditTask}
                onToggleDone={onToggleTask}
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
            onToggleDone={onToggleTask}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
