import { PoolDraggable, PoolDropZone } from './DailyPlannerParts'

export default function DailyPlannerPool({
  poolSections,
  poolOthers,
  projects,
  categories,
  users,
  projectsMap,
  usersMap,
  onToggleTask,
  onEditTask,
}) {
  return (
    <div className="daily-planner__pool">
      <h3 className="daily-planner__pool-title">プール（今週タスクの並び）</h3>
      {poolSections.map((section) => (
        <section key={section.key} className="daily-planner__pool-section">
          <div className="daily-planner__pool-head">
            <strong>{section.title}</strong>
            <span className="text-muted">{section.subtitle}</span>
          </div>
          <div className="cards-grid cards-grid--compact">
            {section.tasks.map((t) => (
              <PoolDraggable
                key={t.id}
                task={t}
                projects={projects}
                categories={categories}
                users={users}
                projectsMap={projectsMap}
                usersMap={usersMap}
                onToggle={onToggleTask}
                onEdit={onEditTask}
              />
            ))}
          </div>
        </section>
      ))}
      {poolOthers.length > 0 && (
        <section className="daily-planner__pool-section">
          <div className="daily-planner__pool-head">
            <strong>その他タスク</strong>
            <span className="text-muted">今週タスクの条件に含まれないタスク</span>
          </div>
          <div className="cards-grid cards-grid--compact">
            {poolOthers.map((t) => (
              <PoolDraggable
                key={t.id}
                task={t}
                projects={projects}
                categories={categories}
                users={users}
                projectsMap={projectsMap}
                usersMap={usersMap}
                onToggle={onToggleTask}
                onEdit={onEditTask}
              />
            ))}
          </div>
        </section>
      )}
      <PoolDropZone />
    </div>
  )
}
