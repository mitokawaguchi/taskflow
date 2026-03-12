import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProfileModal from './ProfileModal'

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

  it('renders login form when authUser is null', () => {
    render(<ProfileModal {...defaultProps} authUser={null} />)
    expect(screen.getByRole('heading', { name: 'プロフィール・ログイン' })).toBeInTheDocument()
    expect(screen.getByText('外側をクリックしても閉じられます。')).toBeInTheDocument()
  })
})
