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
})
