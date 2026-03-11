import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProjectDetail from './ProjectDetail'

const defaultProject = { id: 'p1', name: 'テストプロジェクト', color: '#06d6a0', icon: '📁', endDate: '' }

describe('ProjectDetail', () => {
  const defaultProps = {
    project: defaultProject,
    tasks: [],
    projects: [defaultProject],
    projectsMap: new Map([['p1', defaultProject]]),
    usersMap: new Map(),
    onToggle: vi.fn(),
    onEditTask: vi.fn(),
    onAddTask: vi.fn(),
    sort: 'priority',
    setSort: vi.fn(),
    showDone: true,
  }

  it('renders project name', () => {
    render(<ProjectDetail {...defaultProps} />)
    expect(screen.getByText('テストプロジェクト')).toBeInTheDocument()
  })

  it('renders タスク追加 button', () => {
    render(<ProjectDetail {...defaultProps} />)
    expect(screen.getByRole('button', { name: /タスク追加/ })).toBeInTheDocument()
  })

  it('shows sort options (重要度, 期限, 作成日, 名前)', () => {
    render(<ProjectDetail {...defaultProps} />)
    expect(screen.getByText('ソート:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /重要度/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /期限/ })).toBeInTheDocument()
  })

  it('shows empty state when no tasks', () => {
    render(<ProjectDetail {...defaultProps} />)
    expect(screen.getByText('タスクがありません')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /最初のタスクを追加/ })).toBeInTheDocument()
  })

  it('calls setSort when sort chip clicked', () => {
    const setSort = vi.fn()
    render(<ProjectDetail {...defaultProps} setSort={setSort} />)
    const dueBtn = screen.getByRole('button', { name: /期限/ })
    dueBtn.click()
    expect(setSort).toHaveBeenCalled()
  })

  it('renders task list when tasks provided', () => {
    const tasks = [
      {
        id: 't1',
        title: 'Detail task',
        done: false,
        status: 'todo',
        priority: 'high',
        projectId: 'p1',
        due: '',
        created: 1,
      },
    ]
    render(<ProjectDetail {...defaultProps} tasks={tasks} />)
    expect(screen.getByText('Detail task')).toBeInTheDocument()
  })
})
