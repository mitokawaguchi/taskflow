/**
 * タスク系ビュー（カンバン・ダッシュボード・ガント・一覧）。ARCH-001: App.jsx 短縮のため抽出
 */
import TaskListWithFilters from './TaskListWithFilters'
import KanbanBoard from '../KanbanBoard'
import Dashboard from '../Dashboard'
import GanttChart from '../GanttChart'

export default function ContentAreaTasks({
  view,
  tasksForBoard,
  projects,
  setView,
  categories,
  users,
  projectsMap,
  usersMap,
  moveTaskStatus,
  setEditTask,
  setShowTaskForm,
  openTaskFormForKanbanColumn,
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
  sortedTasks,
  taskFiltersClear,
  onAddTask,
  onEditTask,
  onToggleTask,
}) {
  if (view === 'kanban') {
    return (
      <div className="kanban-view-wrap">
        <KanbanBoard
          tasks={tasksForBoard}
          projects={projects}
          categories={categories}
          users={users}
          projectsMap={projectsMap}
          usersMap={usersMap}
          onMoveTask={moveTaskStatus}
          onEditTask={(task) => {
            setEditTask(task)
            setShowTaskForm(true)
          }}
          onAddTask={openTaskFormForKanbanColumn}
          onToggleTask={onToggleTask}
        />
      </div>
    )
  }
  if (view === 'dashboard') {
    return (
      <Dashboard tasks={tasksForBoard} projects={projects} setView={setView} />
    )
  }
  if (view === 'gantt') {
    return (
      <div className="gantt-view-wrap">
        <GanttChart
          tasks={tasksForBoard}
          projects={projects}
          projectsMap={projectsMap}
          onEditTask={(task) => {
            setEditTask(task)
            setShowTaskForm(true)
          }}
        />
      </div>
    )
  }
  if (view === 'all' || view === 'today' || view === 'overdue') {
    return (
      <TaskListWithFilters
        view={view}
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
        categories={categories}
        projectsMap={projectsMap}
        usersMap={usersMap}
        sortedTasks={sortedTasks}
        onAddTask={onAddTask}
        onEditTask={onEditTask}
        onToggleTask={onToggleTask}
        onClearFilters={taskFiltersClear}
      />
    )
  }
  return null
}
