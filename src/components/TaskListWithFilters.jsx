import TaskCard from '../TaskCard'
import FilterBar from './FilterBar'
import { today } from '../utils'

function daysFromToday(d) {
  if (!d) return null
  const base = new Date(`${today()}T12:00:00`)
  const target = new Date(`${d}T12:00:00`)
  return Math.round((target - base) / 86400000)
}

function isDueSoonTask(task, days = 3) {
  const diff = daysFromToday(task?.due)
  return diff !== null && diff > 0 && diff <= days
}

function renderTaskGrid(tasks, { projects, categories, users, projectsMap, usersMap, onToggleTask, onEditTask }) {
  return (
    <div className="cards-grid cards-grid--compact">
      {tasks.map((t) => (
        <TaskCard
          key={t.id}
          task={t}
          projects={projects}
          categories={categories}
          users={users}
          projectsMap={projectsMap}
          usersMap={usersMap}
          onToggle={onToggleTask}
          onClick={() => onEditTask(t)}
        />
      ))}
    </div>
  )
}

function TodaySections({
  tasks,
  projects,
  categories,
  users,
  projectsMap,
  usersMap,
  onToggleTask,
  onEditTask,
}) {
  const todayStr = today()
  const dueToday = []
  const startsToday = []
  const activeNow = []
  const dueSoon = []
  const otherRelevant = []

  tasks.forEach((task) => {
    if (task.due === todayStr) {
      dueToday.push(task)
      return
    }
    if (task.startDate === todayStr) {
      startsToday.push(task)
      return
    }
    if (task.startDate && task.due && task.startDate < todayStr && task.due > todayStr) {
      activeNow.push(task)
      return
    }
    if (isDueSoonTask(task)) {
      dueSoon.push(task)
      return
    }
    otherRelevant.push(task)
  })

  const sections = [
    { key: 'due-today', title: '今日期限', subtitle: '今日中に締めたいタスク', tasks: dueToday },
    { key: 'start-today', title: '今日開始', subtitle: '今日から動き始めるタスク', tasks: startsToday },
    { key: 'active-now', title: '期間内', subtitle: '今日が実行期間に入っているタスク', tasks: activeNow },
    { key: 'due-soon', title: '期限間近', subtitle: '3日以内に期限が来るタスク', tasks: dueSoon },
    { key: 'other', title: 'その他', subtitle: '今日ページに表示されるその他のタスク', tasks: otherRelevant },
  ].filter((section) => section.tasks.length > 0)

  if (sections.length === 0) return null

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {sections.map((section) => (
        <section key={section.key} style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>{section.title}</h3>
                <span className="badge">{section.tasks.length}</span>
              </div>
              <p className="text-muted" style={{ margin: 0 }}>{section.subtitle}</p>
            </div>
          </div>
          {renderTaskGrid(section.tasks, {
            projects,
            categories,
            users,
            projectsMap,
            usersMap,
            onToggleTask,
            onEditTask,
          })}
        </section>
      ))}
    </div>
  )
}

export default function TaskListWithFilters({
  view,
  filterOpen,
  setFilterOpen,
  hasAnyFilter,
  filterProjectIds,
  setFilterProjectIds,
  filterPriorities,
  setFilterPriorities,
  filterAssigneeId,
  setFilterAssigneeId,
  filterDueFrom,
  setFilterDueFrom,
  filterDueTo,
  setFilterDueTo,
  filterPriorityFrom,
  setFilterPriorityFrom,
  filterPriorityTo,
  setFilterPriorityTo,
  sort,
  setSort,
  projects,
  users,
  categories,
  projectsMap,
  usersMap,
  sortedTasks,
  onAddTask,
  onEditTask,
  onToggleTask,
  onClearFilters,
}) {
  return (
    <>
      <FilterBar
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        hasAnyFilter={hasAnyFilter}
        filterProjectIds={filterProjectIds}
        setFilterProjectIds={setFilterProjectIds}
        filterPriorities={filterPriorities}
        setFilterPriorities={setFilterPriorities}
        filterAssigneeId={filterAssigneeId}
        setFilterAssigneeId={setFilterAssigneeId}
        filterDueFrom={filterDueFrom}
        setFilterDueFrom={setFilterDueFrom}
        filterDueTo={filterDueTo}
        setFilterDueTo={setFilterDueTo}
        filterPriorityFrom={filterPriorityFrom}
        setFilterPriorityFrom={setFilterPriorityFrom}
        filterPriorityTo={filterPriorityTo}
        setFilterPriorityTo={setFilterPriorityTo}
        sort={sort}
        setSort={setSort}
        projects={projects}
        users={users}
      />
      {sortedTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✨</div>
          <p>{hasAnyFilter ? '条件に合うタスクがありません' : 'タスクがありません'}</p>
          {hasAnyFilter ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClearFilters}>
              絞り込みを解除
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onAddTask}>
              タスクを追加
            </button>
          )}
        </div>
      ) : view === 'today' ? (
        <TodaySections
          tasks={sortedTasks}
          projects={projects}
          categories={categories}
          users={users}
          projectsMap={projectsMap}
          usersMap={usersMap}
          onToggleTask={onToggleTask}
          onEditTask={onEditTask}
        />
      ) : (
        renderTaskGrid(sortedTasks, {
          projects,
          categories,
          users,
          projectsMap,
          usersMap,
          onToggleTask,
          onEditTask,
        })
      )}
    </>
  )
}
