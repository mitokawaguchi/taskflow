import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginScreen from './LoginScreen'
import { ProfileLoginForm } from './ProfileLoginForm'
import { LegalLinks } from './LegalLinks'

vi.mock('../api', () => ({
  signInWithPassword: vi.fn(() => Promise.resolve()),
  signUpWithEmail: vi.fn(() => Promise.resolve({ session: null })),
}))

describe('LoginScreen', () => {
  it('renders login screen with title and lead', () => {
    render(<LoginScreen onError={() => {}} />)
    expect(screen.getByText(/Task/)).toBeInTheDocument()
    expect(screen.getByText(/Flow/)).toBeInTheDocument()
    expect(screen.getByText(/ログインしてタスクを管理/)).toBeInTheDocument()
  })

  it('renders ProfileLoginForm with email and password inputs', () => {
    render(<LoginScreen onError={() => {}} />)
    expect(screen.getByLabelText(/メール/)).toBeInTheDocument()
    expect(screen.getByLabelText(/パスワード/)).toBeInTheDocument()
  })

  it('renders LegalLinks in footer', () => {
    render(<LoginScreen onError={() => {}} />)
    expect(screen.getByRole('navigation', { name: '法定ページ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '利用規約' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'プライバシーポリシー' })).toBeInTheDocument()
  })
})

describe('ProfileLoginForm', () => {
  const defaultProps = {
    onSuccess: vi.fn(),
    onError: vi.fn(),
    showCloseButton: true,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows ログイン and アカウント作成 tabs', () => {
    render(<ProfileLoginForm {...defaultProps} />)
    expect(screen.getAllByRole('button', { name: 'ログイン' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: 'アカウント作成' })).toBeInTheDocument()
  })

  it('switches to アカウント作成 when clicked', () => {
    render(<ProfileLoginForm {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'アカウント作成' }))
    expect(screen.getByRole('button', { name: 'アカウントを作成' })).toBeInTheDocument()
  })

  it('shows error when submit with empty email and password', () => {
    const { container } = render(<ProfileLoginForm {...defaultProps} />)
    const form = container.querySelector('form')
    fireEvent.submit(form)
    expect(screen.getByText(/メールとパスワードを入力してください/)).toBeInTheDocument()
  })

  it('shows error when signup with password less than 6 chars', () => {
    render(<ProfileLoginForm {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: 'アカウント作成' }))
    fireEvent.change(screen.getByLabelText(/メール/), { target: { value: 'a@b.co' } })
    fireEvent.change(screen.getByLabelText(/パスワード/), { target: { value: '12345' } })
    fireEvent.submit(screen.getByRole('button', { name: 'アカウントを作成' }).closest('form'))
    expect(screen.getByText(/パスワードは6文字以上/)).toBeInTheDocument()
  })

  it('calls onSuccess when close button clicked and showCloseButton is true', () => {
    const onSuccess = vi.fn()
    render(<ProfileLoginForm {...defaultProps} onSuccess={onSuccess} />)
    fireEvent.click(screen.getByRole('button', { name: /閉じる/ }))
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })
})

describe('LegalLinks', () => {
  it('renders 利用規約, プライバシーポリシー, 免責事項 buttons', () => {
    render(<LegalLinks />)
    expect(screen.getByRole('button', { name: '利用規約' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'プライバシーポリシー' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '免責事項' })).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<LegalLinks className="custom" />)
    const nav = container.querySelector('.legal-links.custom')
    expect(nav).toBeInTheDocument()
  })
})
