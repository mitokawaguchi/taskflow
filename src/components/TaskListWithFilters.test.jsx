import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskListWithFilters from './TaskListWithFilters'

const defaultProps = {
  filterOpen: false,
  setFilterOpen: vi.fn(),
  hasAnyFilter: false,
  filterProjectIds: [],
  setFilterProjectIds: vi.fn(),
  filterPriorities: [],
  setFilterPriorities: vi.fn(),
  filterAssigneeId: '',
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
  projects: [],
  users: [],
  categories: [],
  projectsMap: new Map(),
  usersMap: new Map(),
  sortedTasks: [],
  onAddTask: vi.fn(),
  onEditTask: vi.fn(),
  onToggleTask: vi.fn(),
  onClearFilters: vi.fn(),
}

describe('TaskListWithFilters', () => {
  it('renders filter toggle and empty state when no tasks', () => {
    render(<TaskListWithFilters {...defaultProps} />)
    expect(screen.getByRole('button', { name: /絞り込み・ソート/ })).toBeInTheDocument()
    expect(screen.getByText('タスクがありません')).toBeInTheDocument()
    expect(screen.getByText('タスクを追加')).toBeInTheDocument()
  })

  it('shows filter-active empty state and clear button when hasAnyFilter', () => {
    render(<TaskListWithFilters {...defaultProps} hasAnyFilter sortedTasks={[]} />)
    expect(screen.getByText('条件に合うタスクがありません')).toBeInTheDocument()
    expect(screen.getByText('絞り込みを解除')).toBeInTheDocument()
  })

  it('calls onClearFilters when 絞り込みを解除 is clicked', () => {
    const onClearFilters = vi.fn()
    render(
      <TaskListWithFilters {...defaultProps} hasAnyFilter onClearFilters={onClearFilters} />
    )
    fireEvent.click(screen.getByText('絞り込みを解除'))
    expect(onClearFilters).toHaveBeenCalled()
  })

  it('calls onAddTask when タスクを追加 is clicked', () => {
    const onAddTask = vi.fn()
    render(<TaskListWithFilters {...defaultProps} onAddTask={onAddTask} />)
    fireEvent.click(screen.getByText('タスクを追加'))
    expect(onAddTask).toHaveBeenCalled()
  })

  it('renders task cards when sortedTasks has items', () => {
    const tasks = [
      { id: 't1', title: 'テストタスク1', done: false, priority: 'high', projectId: null },
    ]
    render(<TaskListWithFilters {...defaultProps} sortedTasks={tasks} />)
    expect(screen.getByText('テストタスク1')).toBeInTheDocument()
  })

  it('shows 条件あり badge when hasAnyFilter', () => {
    render(<TaskListWithFilters {...defaultProps} hasAnyFilter />)
    expect(screen.getByText('条件あり')).toBeInTheDocument()
  })
})
