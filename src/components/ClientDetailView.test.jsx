import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ClientDetailView from './ClientDetailView'

describe('ClientDetailView', () => {
  const defaultProps = {
    clientId: 'c1',
    clients: [
      { id: 'c1', name: 'テストクライアント', color: '#333', icon: '🤝' },
    ],
    remembers: [
      { id: 'r1', clientId: 'c1', body: '覚えておくこと1', created: 1 },
    ],
    onBack: vi.fn(),
    onAddRemember: vi.fn(),
    onUpdateRemember: vi.fn(),
    onDeleteRemember: vi.fn(),
  }

  it('returns null when client not found', () => {
    const { container } = render(
      <ClientDetailView
        {...defaultProps}
        clientId="nonexistent"
        clients={defaultProps.clients}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders client name and back button when client found', () => {
    render(<ClientDetailView {...defaultProps} />)
    expect(screen.getByText('テストクライアント')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /クライアント一覧/ })).toBeInTheDocument()
  })

  it('calls onBack when back button clicked', () => {
    const onBack = vi.fn()
    render(<ClientDetailView {...defaultProps} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /クライアント一覧/ }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('shows only remembers for this client', () => {
    render(
      <ClientDetailView
        {...defaultProps}
        remembers={[
          { id: 'r1', clientId: 'c1', body: 'メモ1', created: 1 },
          { id: 'r2', clientId: 'c2', body: '他クライアント', created: 2 },
        ]}
      />
    )
    expect(screen.getByText('メモ1')).toBeInTheDocument()
    expect(screen.queryByText('他クライアント')).not.toBeInTheDocument()
  })
})
