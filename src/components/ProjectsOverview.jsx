import {
  DndContext,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { endDateLabel } from '../utils'
import SortableProjectCard from './SortableProjectCard'

export default function ProjectsOverview({
  showDone,
  setShowDone,
  onAddProject,
  sensors,
  onDragStart,
  onDragEnd,
  activeProjects,
  completedProjects,
  dragActiveId,
  renderProjectCard,
  setView,
  toggleTask,
  openTaskFormForProject,
}) {
  return (
    <>
      <div className="section-header">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setShowDone((s) => !s)}
        >
          {showDone ? '完了を非表示' : '完了を表示'}
        </button>
        <button type="button" className="btn btn-primary" onClick={onAddProject}>
          + プロジェクト追加
        </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={({ active }) => onDragStart(active?.id)}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={activeProjects.map((x) => x.project.id)}
          strategy={rectSortingStrategy}
        >
          <div className="projects-grid">
            {activeProjects.map((item) => (
              <SortableProjectCard
                key={item.project.id}
                item={item}
                setView={setView}
                toggleTask={toggleTask}
                openTaskFormForProject={openTaskFormForProject}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay dropAnimation={null}>
          {dragActiveId ? (() => {
            const item = activeProjects.find((x) => x.project.id === dragActiveId)
            if (!item) return null
            const { project: p, ptasks, pct } = item
            return (
              <div
                className="project-card project-card-overlay"
                style={{
                  background: `${p.color}28`,
                  border: `1px solid ${p.color}60`,
                }}
              >
                <div className="project-card-header cursor-grabbing">
                  <span className="project-card-drag-handle" aria-hidden>⋮⋮</span>
                  <div className="project-icon" style={{ background: `${p.color}20` }}>{p.icon}</div>
                  <div>
                    <div className="project-name">{p.name}</div>
                    <div className="project-count">
                      {ptasks.filter((t) => !t.done).length} 件残り
                      {p.endDate && <span className="project-due"> · {endDateLabel(p.endDate)}</span>}
                    </div>
                  </div>
                </div>
                <div className="project-progress">
                  <div
                    className="project-progress-fill"
                    style={{ width: `${pct}%`, background: p.color }}
                  />
                </div>
                <div className="project-pct-label">{pct}% 完了</div>
              </div>
            )
          })() : null}
        </DragOverlay>
      </DndContext>
      {completedProjects.length > 0 && (
        <div className="projects-completed-section">
          <h2 className="projects-completed-title">完了したプロジェクト</h2>
          <div className="projects-grid">
            {completedProjects.map(renderProjectCard)}
          </div>
        </div>
      )}
    </>
  )
}
