import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import SortableProjectCard from './SortableProjectCard'
import ProjectCardDragPreview from './ProjectCardDragPreview'

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
          <ProjectCardDragPreview
            item={dragActiveId ? activeProjects.find((x) => x.project.id === dragActiveId) : null}
          />
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
