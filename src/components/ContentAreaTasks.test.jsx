import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ContentAreaTasks from './ContentAreaTasks'

vi.mock('../KanbanBoard', () => ({
  default: () => <div data-testid="kanban-board">KanbanBoard</div>,
}))
vi.mock('../Dashboard', () => ({
  default: ({ setView }) => (
    <div data-testid="dashboard">
      <button type="button" onClick={() => setView('p:p1')}>goto project</button>
    </div>
  ),
}))
vi.mock('../GanttChart', () => ({
  default: () => <div data-testid="gantt-chart">GanttChart</div>,
}))
vi.mock('./TaskListWithFilters', () => ({
  default: () => <div data-testid="task-list">TaskList</div>,
}))
vi.mock('../features/daily-planner/DailyPlannerPage', () => ({
  default: () => <div data-testid="daily-planner">DailyPlanner</div>,
}))

const baseProps = {
  view: 'kanban',
  tasksForBoard: [],
  projects: [],
  setView: vi.fn(),
  categories: [],
  users: [],
  projectsMap: new Map(),
  usersMap: new Map(),
  moveTaskStatus: vi.fn(),
  setEditTask: vi.fn(),
  setShowTaskForm: vi.fn(),
  openTaskFormForKanbanColumn: vi.fn(),
  filterOpen: false,
  setFilterOpen: vi.fn(),
  hasAnyFilter: false,
  filterProjectIds: [],
  setFilterProjectIds: vi.fn(),
  filterPriorities: [],
  setFilterPriorities: vi.fn(),
  filterAssigneeId: null,
  setFilterAssigneeId: vi.fn(),
  filterDueFrom: '',
  setFilterDueFrom: vi.fn(),
  filterDueTo: '',
  setFilterDueTo: vi.fn(),
  filterPriorityFrom: '',
  setFilterPriorityFrom: vi.fn(),
  filterPriorityTo: '',
  setFilterPriorityTo: vi.fn(),
  sort: 'priority',
  setSort: vi.fn(),
  sortedTasks: [],
  taskFiltersClear: vi.fn(),
  onAddTask: vi.fn(),
  onEditTask: vi.fn(),
  onToggleTask: vi.fn(),
  patchTask: vi.fn(),
  weeklyReviews: [],
  dailyPlanner: { todayTaskIds: [], tomorrowTaskIds: [], plannerAnchorYmd: null },
  setDailyPlanner: vi.fn(),
  addToast: vi.fn(),
}

describe('ContentAreaTasks', () => {
  it('renders KanbanBoard on kanban view', () => {
    render(<ContentAreaTasks {...baseProps} view="kanban" />)
    expect(screen.getByTestId('kanban-board')).toBeInTheDocument()
  })

  it('renders Dashboard on dashboard view', () => {
    render(<ContentAreaTasks {...baseProps} view="dashboard" />)
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
  })

  it('renders GanttChart on gantt view', () => {
    render(<ContentAreaTasks {...baseProps} view="gantt" />)
    expect(screen.getByTestId('gantt-chart')).toBeInTheDocument()
  })

  it('renders DailyPlanner on daily views', () => {
    render(<ContentAreaTasks {...baseProps} view="daily-today" />)
    expect(screen.getByTestId('daily-planner')).toBeInTheDocument()
  })

  it('renders TaskList on all/week-tasks/overdue views', () => {
    for (const view of ['all', 'week-tasks', 'overdue']) {
      const { unmount } = render(<ContentAreaTasks {...baseProps} view={view} />)
      expect(screen.getByTestId('task-list')).toBeInTheDocument()
      unmount()
    }
  })

  it('passes setView to Dashboard for project navigation', () => {
    const setView = vi.fn()
    render(<ContentAreaTasks {...baseProps} view="dashboard" setView={setView} />)
    screen.getByText('goto project').click()
    expect(setView).toHaveBeenCalledWith('p:p1')
  })

  it('wraps kanban in kanban-view-wrap for responsive scroll', () => {
    const { container } = render(<ContentAreaTasks {...baseProps} view="kanban" />)
    expect(container.querySelector('.kanban-view-wrap')).toBeTruthy()
  })
})
