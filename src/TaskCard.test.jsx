import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskCard from './TaskCard'

const defaultTask = {
  id: 't1',
  title: 'テストタスク',
  desc: '説明文',
  priority: 'medium',
  projectId: 'p1',
  due: '2025-03-20',
  done: false,
  created: Date.now(),
}

const defaultProjects = [
  { id: 'p1', name: 'プロジェクト1', color: '#06d6a0', icon: '📁' },
]

describe('TaskCard', () => {
  it('renders task title', () => {
    render(
      <TaskCard
        task={defaultTask}
        projects={defaultProjects}
        onToggle={vi.fn()}
        onClick={vi.fn()}
      />
    )
    expect(screen.getByText('テストタスク')).toBeInTheDocument()
  })

  it('renders project name when project exists', () => {
    render(
      <TaskCard
        task={defaultTask}
        projects={defaultProjects}
        onToggle={vi.fn()}
        onClick={vi.fn()}
      />
    )
    expect(screen.getByText('プロジェクト1')).toBeInTheDocument()
  })

  it('renders priority label', () => {
    render(
      <TaskCard
        task={defaultTask}
        projects={defaultProjects}
        onToggle={vi.fn()}
        onClick={vi.fn()}
      />
    )
    expect(screen.getByText('中')).toBeInTheDocument()
  })

  it('shows visible progress label (not color-only)', () => {
    render(
      <TaskCard
        task={defaultTask}
        projects={defaultProjects}
        onToggle={vi.fn()}
        onClick={vi.fn()}
      />
    )
    expect(screen.getByTitle('進捗: 未着手')).toBeInTheDocument()
    expect(screen.getByText('未着手')).toBeInTheDocument()
  })

  it('applies status ribbon class for in_progress', () => {
    const { container } = render(
      <TaskCard
        task={{ ...defaultTask, status: 'in_progress' }}
        projects={defaultProjects}
        onToggle={vi.fn()}
        onClick={vi.fn()}
      />
    )
    expect(container.querySelector('.task-card--status-in_progress')).toBeTruthy()
  })

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn()
    render(
      <TaskCard
        task={defaultTask}
        projects={defaultProjects}
        onToggle={vi.fn()}
        onClick={onClick}
      />
    )
    fireEvent.click(screen.getByText('テストタスク'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('calls onToggle when check area is clicked', () => {
    const onToggle = vi.fn()
    const { container } = render(
      <TaskCard
        task={defaultTask}
        projects={defaultProjects}
        onToggle={onToggle}
        onClick={vi.fn()}
      />
    )
    const check = container.querySelector('.card-check')
    expect(check).toBeInTheDocument()
    fireEvent.click(check)
    expect(onToggle).toHaveBeenCalledWith('t1')
  })

  it('has done class when task.done is true', () => {
    const { container } = render(
      <TaskCard
        task={{ ...defaultTask, done: true }}
        projects={defaultProjects}
        onToggle={vi.fn()}
        onClick={vi.fn()}
      />
    )
    expect(container.querySelector('.task-card.done')).toBeInTheDocument()
  })
})
