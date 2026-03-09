import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ClientForm from './ClientForm'

describe('ClientForm', () => {
  it('renders new client title when no client', () => {
    render(<ClientForm onSave={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('新しいクライアント')).toBeInTheDocument()
  })

  it('renders edit title when client provided', () => {
    render(
      <ClientForm
        client={{ id: 'c1', name: 'A', icon: '🤝', color: '#333' }}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText('クライアントを編集')).toBeInTheDocument()
  })
})
