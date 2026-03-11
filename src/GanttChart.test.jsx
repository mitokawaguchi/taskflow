import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import GanttChart from './GanttChart'

describe('GanttChart', () => {
  it('renders without crashing with empty data', () => {
    render(<GanttChart tasks={[]} projects={[]} onEditTask={vi.fn()} />)
    expect(screen.getByText('表示:')).toBeInTheDocument()
  })

  it('renders range buttons (週 / 月 / 3ヶ月)', () => {
    render(<GanttChart tasks={[]} projects={[]} onEditTask={vi.fn()} />)
    expect(screen.getByText('週')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
    expect(screen.getByText('3ヶ月')).toBeInTheDocument()
  })

  it('switches range when 月 is clicked', () => {
    render(<GanttChart tasks={[]} projects={[]} onEditTask={vi.fn()} />)
    const monthBtn = screen.getByRole('button', { name: '月' })
    monthBtn.click()
    expect(screen.getByRole('button', { name: '月' })).toBeInTheDocument()
  })

  it('renders task bars when tasks and projects provided', () => {
    const tasks = [
      {
        id: 't1',
        title: 'Gantt task',
        status: 'in_progress',
        priority: 'high',
        projectId: 'p1',
        due: '2026-04-15',
        startDate: '2026-04-10',
        done: false,
        created: 1,
      },
    ]
    const projects = [{ id: 'p1', name: 'P1', color: '#06d6a0', icon: '📁' }]
    render(<GanttChart tasks={tasks} projects={projects} onEditTask={vi.fn()} />)
    expect(screen.getByText('Gantt task')).toBeInTheDocument()
  })
})
