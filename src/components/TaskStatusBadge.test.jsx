import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskStatusBadge } from './TaskStatusBadge'

describe('TaskStatusBadge', () => {
  it('renders label and mark for todo', () => {
    render(<TaskStatusBadge statusKey="todo" />)
    expect(screen.getByText('未着手')).toBeInTheDocument()
    expect(screen.getByTitle('進捗: 未着手')).toBeInTheDocument()
  })

  it('renders in_progress label', () => {
    render(<TaskStatusBadge statusKey="in_progress" />)
    expect(screen.getByText('進行中')).toBeInTheDocument()
  })

  it('review shows wait hint in title', () => {
    render(<TaskStatusBadge statusKey="review" />)
    expect(screen.getByText('レビュー中')).toBeInTheDocument()
    expect(screen.getByTitle('進捗: レビュー中（確認待ち）')).toBeInTheDocument()
  })
})
