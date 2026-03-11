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

  it('has add remember input and 追加 button', () => {
    render(<ClientDetail {...defaultProps} />)
    expect(screen.getByPlaceholderText(/言われたこと・覚えておきたいこと/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument()
  })

  it('shows empty message when no remembers', () => {
    render(<ClientDetail {...defaultProps} />)
    expect(screen.getByText(/まだありません/)).toBeInTheDocument()
  })

  it('shows remember list when remembers provided', () => {
    render(
      <ClientDetail
        {...defaultProps}
        remembers={[{ id: 'r1', clientId: 'c1', body: 'メモ本文', created: 1 }]}
      />
    )
    expect(screen.getByText('メモ本文')).toBeInTheDocument()
  })
})
