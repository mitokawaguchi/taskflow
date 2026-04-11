import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SettingsModal from './SettingsModal'

vi.mock('../api', () => ({
  insertUser: vi.fn(() => Promise.resolve({ id: 'u1', name: 'Test', email: null })),
  fetchUsers: vi.fn(() => Promise.resolve([])),
}))

describe('SettingsModal', () => {
  const defaultProps = {
    theme: 'dark',
    setTheme: vi.fn(),
    accentHex: '',
    setAccentHex: vi.fn(),
    onClose: vi.fn(),
    users: [],
    setUsers: vi.fn(),
    notifyReminderEnabled: false,
    setNotifyReminderEnabled: vi.fn(),
    addToast: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders 設定 title', () => {
    render(<SettingsModal {...defaultProps} />)
    expect(screen.getByRole('heading', { name: '設定' })).toBeInTheDocument()
  })

  it('キーカラーのプリセットを表示する', () => {
    render(<SettingsModal {...defaultProps} />)
    expect(screen.getByText('キーカラー')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'アプリ既定' })).toBeInTheDocument()
  })

  it('カード左帯の凡例を表示する', () => {
    render(<SettingsModal {...defaultProps} />)
    expect(screen.getByRole('heading', { name: /タスクカードの「左の帯」と色/ })).toBeInTheDocument()
  })

  it('shows ダーク when theme is dark', () => {
    render(<SettingsModal {...defaultProps} theme="dark" />)
    expect(screen.getByText('ダーク')).toBeInTheDocument()
  })

  it('shows ライト when theme is light', () => {
    render(<SettingsModal {...defaultProps} theme="light" />)
    expect(screen.getByText('ライト')).toBeInTheDocument()
  })

  it('calls onClose when 閉じる is clicked', () => {
    const onClose = vi.fn()
    render(<SettingsModal {...defaultProps} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: '閉じる' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows empty member message when users is empty', () => {
    render(<SettingsModal {...defaultProps} />)
    expect(screen.getByText(/メンバーがいません/)).toBeInTheDocument()
  })

  it('shows member names when users provided', () => {
    render(
      <SettingsModal
        {...defaultProps}
        users={[{ id: 'u1', name: 'Alice', email: 'a@b.co', avatarUrl: '' }]}
      />
    )
    expect(screen.getByText(/Alice/)).toBeInTheDocument()
    expect(screen.getByText(/a@b.co/)).toBeInTheDocument()
  })
})
