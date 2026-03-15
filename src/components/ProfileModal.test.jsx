import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ProfileModal from './ProfileModal'
import { signOut } from '../api'

vi.mock('../api', () => ({
  updateAuthUserMetadata: vi.fn(() => Promise.resolve()),
  updateAuthPassword: vi.fn(() => Promise.resolve()),
  signOut: vi.fn(() => Promise.resolve()),
}))

describe('ProfileModal', () => {
  const defaultProps = {
    profileDisplayName: '',
    setProfileDisplayName: vi.fn(),
    profileNewPassword: '',
    setProfileNewPassword: vi.fn(),
    profileConfirmPassword: '',
    setProfileConfirmPassword: vi.fn(),
    profileLoading: false,
    setProfileLoading: vi.fn(),
    profileError: '',
    setProfileError: vi.fn(),
    onClose: vi.fn(),
    addToast: vi.fn(),
    setAuthUser: vi.fn(),
  }

  it('renders title and 閉じる when logged in', () => {
    render(
      <ProfileModal
        {...defaultProps}
        authUser={{ email: 'u@example.com', id: 'uid-1' }}
      />
    )
    expect(screen.getByRole('heading', { name: 'プロフィール・ログイン' })).toBeInTheDocument()
    expect(screen.getByText('ログイン中:')).toBeInTheDocument()
    expect(screen.getByText('閉じる')).toBeInTheDocument()
    expect(screen.getByText('ログアウト')).toBeInTheDocument()
  })

  it('calls onClose when 閉じる is clicked', () => {
    const onClose = vi.fn()
    render(
      <ProfileModal
        {...defaultProps}
        onClose={onClose}
        authUser={{ email: 'u@example.com', id: 'uid-1' }}
      />
    )
    fireEvent.click(screen.getByText('閉じる'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows ログアウトしますか？ and はい/いいえ when ログアウト is clicked', () => {
    render(
      <ProfileModal
        {...defaultProps}
        authUser={{ email: 'u@example.com', id: 'uid-1' }}
      />
    )
    fireEvent.click(screen.getByText('ログアウト'))
    expect(screen.getByText('ログアウトしますか？')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'はい' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'いいえ' })).toBeInTheDocument()
  })

  it('hides confirmation when いいえ is clicked', () => {
    render(
      <ProfileModal
        {...defaultProps}
        authUser={{ email: 'u@example.com', id: 'uid-1' }}
      />
    )
    fireEvent.click(screen.getByText('ログアウト'))
    fireEvent.click(screen.getByRole('button', { name: 'いいえ' }))
    expect(screen.queryByText('ログアウトしますか？')).not.toBeInTheDocument()
    expect(screen.getByText('ログアウト')).toBeInTheDocument()
    expect(screen.getByText('閉じる')).toBeInTheDocument()
  })

  it('calls signOut, setAuthUser(null) and onClose when はい is clicked', async () => {
    const onClose = vi.fn()
    const setAuthUser = vi.fn()
    render(
      <ProfileModal
        {...defaultProps}
        onClose={onClose}
        setAuthUser={setAuthUser}
        authUser={{ email: 'u@example.com', id: 'uid-1' }}
      />
    )
    fireEvent.click(screen.getByText('ログアウト'))
    fireEvent.click(screen.getByRole('button', { name: 'はい' }))
    await waitFor(() => {
      expect(signOut).toHaveBeenCalled()
      expect(setAuthUser).toHaveBeenCalledWith(null)
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('shows toast when はい is clicked and signOut fails', async () => {
    vi.mocked(signOut).mockRejectedValueOnce(new Error('sign out error'))
    const addToast = vi.fn()
    render(
      <ProfileModal
        {...defaultProps}
        addToast={addToast}
        authUser={{ email: 'u@example.com', id: 'uid-1' }}
      />
    )
    fireEvent.click(screen.getByText('ログアウト'))
    fireEvent.click(screen.getByRole('button', { name: 'はい' }))
    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith('❌', 'ログアウトに失敗しました', 'sign out error')
    })
  })

  it('renders login form when authUser is null', () => {
    render(<ProfileModal {...defaultProps} authUser={null} />)
    expect(screen.getByRole('heading', { name: 'プロフィール・ログイン' })).toBeInTheDocument()
    expect(screen.getByText('外側をクリックしても閉じられます。')).toBeInTheDocument()
  })
})
