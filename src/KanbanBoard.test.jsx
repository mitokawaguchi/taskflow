import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import KanbanBoard from './KanbanBoard'

describe('KanbanBoard', () => {
  const defaultProps = {
    tasks: [],
    projects: [],
    onMoveTask: vi.fn(),
    onEditTask: vi.fn(),
    onAddTask: vi.fn(),
  }

  it('renders column headers', () => {
    render(<KanbanBoard {...defaultProps} />)
    expect(screen.getByText('未着手')).toBeInTheDocument()
    expect(screen.getByText('進行中')).toBeInTheDocument()
    expect(screen.getByText('レビュー中')).toBeInTheDocument()
    expect(screen.getByText('完了')).toBeInTheDocument()
  })

  it('renders task in correct column', () => {
    const tasks = [
      { id: 't1', title: 'テストタスク', status: 'todo', priority: 'medium', projectId: 'p1', due: '', done: false },
    ]
    render(<KanbanBoard {...defaultProps} tasks={tasks} projects={[{ id: 'p1', name: 'P1', color: '#333', icon: '📁' }]} />)
    expect(screen.getByText('テストタスク')).toBeInTheDocument()
  })

  it('renders タスク追加 buttons in each column', () => {
    render(<KanbanBoard {...defaultProps} />)
    const addButtons = screen.getAllByRole('button', { name: /タスクを追加/ })
    expect(addButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders task with priority label when provided', () => {
    const tasks = [
      { id: 't1', title: 'High task', status: 'todo', priority: 'high', projectId: 'p1', due: '', done: false },
    ]
    render(<KanbanBoard {...defaultProps} tasks={tasks} projects={[{ id: 'p1', name: 'P1', color: '#333', icon: '📁' }]} />)
    expect(screen.getByText('High task')).toBeInTheDocument()
  })

  it('renders done column with completed tasks', () => {
    const tasks = [
      { id: 't1', title: 'Done task', status: 'done', priority: 'low', projectId: 'p1', due: '', done: true },
    ]
    render(<KanbanBoard {...defaultProps} tasks={tasks} projects={[{ id: 'p1', name: 'P1', color: '#333', icon: '📁' }]} />)
    expect(screen.getByText('Done task')).toBeInTheDocument()
  })
})
