import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MorningModal from './MorningModal'

describe('MorningModal', () => {
  const defaultProps = {
    tasks: [],
    projects: [],
    onClose: vi.fn(),
  }

  it('renders empty state when no today/overdue tasks', () => {
    render(<MorningModal {...defaultProps} />)
    expect(screen.getByText(/今日のタスクはありません/)).toBeInTheDocument()
  })

  it('renders 開始する button and calls onClose when clicked', () => {
    const onClose = vi.fn()
    render(<MorningModal {...defaultProps} onClose={onClose} />)
    const btn = screen.getByRole('button', { name: /開始する/ })
    fireEvent.click(btn)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows task title when task is due today', () => {
    const today = new Date().toISOString().slice(0, 10)
    const tasks = [{ id: 't1', title: '今日やること', done: false, due: today, projectId: 'p1', priority: 'high' }]
    const projects = [{ id: 'p1', name: 'P1', icon: '📁', color: '#06d6a0' }]
    render(<MorningModal {...defaultProps} tasks={tasks} projects={projects} />)
    expect(screen.getByText('今日やること')).toBeInTheDocument()
  })
})
