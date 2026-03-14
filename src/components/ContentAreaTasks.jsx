/**
 * タスク系ビュー（カンバン・ダッシュボード・ガント・一覧）。ARCH-001: App.jsx 短縮のため抽出
 */
import { lazy, Suspense } from 'react'
import TaskListWithFilters from './TaskListWithFilters'

const LazyKanban = lazy(() => import('../KanbanBoard'))
const LazyDashboard = lazy(() => import('../Dashboard'))
const LazyGantt = lazy(() => import('../GanttChart'))

export default function ContentAreaTasks({
  view,
  tasksForBoard,
  projects,
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
        <Suspense fallback={<div className="loading-placeholder">読み込み中...</div>}>
          <LazyKanban
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
          />
        </Suspense>
      </div>
    )
  }
  if (view === 'dashboard') {
    return (
      <Suspense fallback={<div className="loading-placeholder">読み込み中...</div>}>
        <LazyDashboard tasks={tasksForBoard} projects={projects} />
      </Suspense>
    )
  }
  if (view === 'gantt') {
    return (
      <div className="gantt-view-wrap">
        <Suspense fallback={<div className="loading-placeholder">読み込み中...</div>}>
          <LazyGantt
            tasks={tasksForBoard}
            projects={projects}
            projectsMap={projectsMap}
            onEditTask={(task) => {
              setEditTask(task)
              setShowTaskForm(true)
            }}
          />
        </Suspense>
      </div>
    )
  }
  if (view === 'all' || view === 'today' || view === 'overdue') {
    return (
      <TaskListWithFilters
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
