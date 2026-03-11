import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'

describe('Dashboard', () => {
  it('renders without crashing with empty data', () => {
    render(<Dashboard tasks={[]} projects={[]} />)
    expect(screen.getByText('全タスク')).toBeInTheDocument()
  })

  it('renders stats when tasks provided', () => {
    const tasks = [
      { id: 't1', title: 'A', done: false, status: 'todo', due: '', priority: 'medium', projectId: 'p1' },
      { id: 't2', title: 'B', done: true, status: 'done', due: '', priority: 'low', projectId: 'p1' },
    ]
    const projects = [{ id: 'p1', name: 'P1', color: '#333', icon: '📁' }]
    render(<Dashboard tasks={tasks} projects={projects} />)
    expect(screen.getByText(/P1/)).toBeInTheDocument()
  })

  it('shows status breakdown labels (未着手, 進行中, レビュー中, 完了)', () => {
    render(<Dashboard tasks={[]} projects={[]} />)
    expect(screen.getByText('未着手')).toBeInTheDocument()
    expect(screen.getAllByText('進行中').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('レビュー中')).toBeInTheDocument()
    expect(screen.getAllByText('完了').length).toBeGreaterThanOrEqual(1)
  })

  it('shows 期限超過 card in summary', () => {
    render(<Dashboard tasks={[]} projects={[]} />)
    expect(screen.getByText('期限超過')).toBeInTheDocument()
  })

  it('computes progress per project when tasks and projects provided', () => {
    const tasks = [
      { id: 't1', title: 'A', done: true, status: 'done', due: '', priority: 'medium', projectId: 'p1', created: 1 },
      { id: 't2', title: 'B', done: false, status: 'todo', due: '', priority: 'low', projectId: 'p1', created: 2 },
    ]
    const projects = [{ id: 'p1', name: 'Proj1', color: '#06d6a0', icon: '📁' }]
    render(<Dashboard tasks={tasks} projects={projects} />)
    expect(screen.getByText(/Proj1/)).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })
})
