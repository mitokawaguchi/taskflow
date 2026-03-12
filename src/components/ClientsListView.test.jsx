import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ClientsListView from './ClientsListView'

describe('ClientsListView', () => {
  it('renders empty state when no clients', () => {
    render(
      <ClientsListView
        clients={[]}
        remembers={[]}
        onAddClient={vi.fn()}
        onEditClient={vi.fn()}
        onOpenClientDetail={vi.fn()}
      />
    )
    expect(screen.getByText('クライアントがありません')).toBeInTheDocument()
    expect(screen.getByText('最初のクライアントを追加')).toBeInTheDocument()
  })

  it('renders client cards with remembers', () => {
    const clients = [
      { id: 'c1', name: 'クライアントA', color: '#3b82f6', icon: '🏢' },
    ]
    const remembers = [
      { id: 'r1', clientId: 'c1', body: 'メモ1' },
    ]
    render(
      <ClientsListView
        clients={clients}
        remembers={remembers}
        onAddClient={vi.fn()}
        onEditClient={vi.fn()}
        onOpenClientDetail={vi.fn()}
      />
    )
    expect(screen.getByText('クライアントA')).toBeInTheDocument()
    expect(screen.getByText('メモ1')).toBeInTheDocument()
    expect(screen.getByText('設定')).toBeInTheDocument()
    expect(screen.getByText('編集・追加')).toBeInTheDocument()
  })

  it('calls onOpenClientDetail when 編集・追加 is clicked', () => {
    const onOpenClientDetail = vi.fn()
    const clients = [{ id: 'c1', name: 'A', color: '#000', icon: '📁' }]
    render(
      <ClientsListView
        clients={clients}
        remembers={[]}
        onAddClient={vi.fn()}
        onEditClient={vi.fn()}
        onOpenClientDetail={onOpenClientDetail}
      />
    )
    fireEvent.click(screen.getByText('編集・追加'))
    expect(onOpenClientDetail).toHaveBeenCalledWith('c1')
  })
})
