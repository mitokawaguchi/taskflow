import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ClientDetail from './ClientDetail'

describe('ClientDetail', () => {
  const defaultProps = {
    client: { id: 'c1', name: 'テストクライアント', color: '#333', icon: '🤝' },
    remembers: [],
    onAddRemember: vi.fn(),
    onUpdateRemember: vi.fn(),
    onDeleteRemember: vi.fn(),
  }

  it('renders client name', () => {
    render(<ClientDetail {...defaultProps} />)
    expect(screen.getByText('テストクライアント')).toBeInTheDocument()
  })

  it('has accessible section label', () => {
    render(<ClientDetail {...defaultProps} />)
    expect(screen.getByRole('region', { name: /テストクライアント.*覚えておくこと/ })).toBeInTheDocument()
  })
})
