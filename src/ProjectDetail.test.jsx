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
})
