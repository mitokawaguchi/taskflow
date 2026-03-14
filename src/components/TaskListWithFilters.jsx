import TaskCard from '../TaskCard'
import FilterBar from './FilterBar'

export default function TaskListWithFilters({
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
      ) : (
        <div className="cards-grid cards-grid--compact">
          {sortedTasks.map((t) => (
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
      )}
    </>
  )
}
