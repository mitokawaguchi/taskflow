import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CategoriesView from './CategoriesView'

vi.mock('../api', () => ({
  insertCategory: vi.fn(() => Promise.resolve({ id: 'c1', name: 'Cat', color: '#6b7280' })),
  fetchCategories: vi.fn(() => Promise.resolve([])),
}))

describe('CategoriesView', () => {
  const defaultProps = {
    categories: [],
    setCategories: vi.fn(),
    addToast: vi.fn(),
  }

  it('renders lead text', () => {
    render(<CategoriesView {...defaultProps} />)
    expect(screen.getByText(/タスクに付けるカテゴリを追加・管理します/)).toBeInTheDocument()
  })

  it('shows empty state when no categories', () => {
    render(<CategoriesView {...defaultProps} />)
    expect(screen.getByText(/カテゴリがありません/)).toBeInTheDocument()
  })

  it('shows category names when categories provided', () => {
    render(
      <CategoriesView
        {...defaultProps}
        categories={[{ id: 'c1', name: 'Work', color: '#333' }]}
      />
    )
    expect(screen.getByText('Work')).toBeInTheDocument()
  })

  it('has 新しいカテゴリ名 input', () => {
    render(<CategoriesView {...defaultProps} />)
    expect(screen.getByLabelText(/新しいカテゴリ名/)).toBeInTheDocument()
  })
})
