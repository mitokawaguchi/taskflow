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
})
