import { useState, useCallback } from 'react'
import { signInWithPassword, signUpWithEmail } from '../api'

export function ProfileLoginForm({ onSuccess, onError, showCloseButton = true }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [signUpMessage, setSignUpMessage] = useState('')

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!email.trim() || !password) {
        setError(isSignUp ? 'メールとパスワードを入力してください（6文字以上推奨）' : 'メールとパスワードを入力してください')
        return
      }
      if (isSignUp && password.length < 6) {
        setError('パスワードは6文字以上にしてください')
        return
      }
      setError('')
      setSignUpMessage('')
      setLoading(true)
      try {
        if (isSignUp) {
          const data = await signUpWithEmail(email.trim(), password)
          if (data?.session) {
            onSuccess()
          } else {
            setSignUpMessage('確認メールを送りました。メール内のリンクから認証してください。')
            onError?.('✅', 'アカウント作成', '確認メールを送りました')
          }
        } else {
          await signInWithPassword(email.trim(), password)
          onSuccess()
        }
      } catch (e) {
        let msg = e?.message ?? (isSignUp ? 'アカウント作成に失敗しました' : 'ログインに失敗しました')
        if (isSignUp && (e?.code === 'user_already_registered' || e?.code === 'user_already_exists' || /already registered|already exists|既に登録/i.test(String(msg)))) {
          msg = 'このメールアドレスは既に登録されています。ログインタブからサインインしてください。'
        }
        setError(msg)
        onError?.('❌', isSignUp ? 'アカウント作成' : 'ログイン', msg)
      } finally {
        setLoading(false)
      }
    },
    [email, password, isSignUp, onSuccess, onError]
  )

  return (
    <form onSubmit={handleSubmit} className="form-group">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          className={`btn btn-ghost btn-sm ${!isSignUp ? 'active' : ''}`}
          onClick={() => {
            setIsSignUp(false)
            setError('')
            setSignUpMessage('')
          }}
          aria-pressed={!isSignUp}
        >
          ログイン
        </button>
        <button
          type="button"
          className={`btn btn-ghost btn-sm ${isSignUp ? 'active' : ''}`}
          onClick={() => {
            setIsSignUp(true)
            setError('')
            setSignUpMessage('')
          }}
          aria-pressed={isSignUp}
        >
          アカウント作成
        </button>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="profile-login-email">
          メール
        </label>
        <input
          id="profile-login-email"
          type="email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          autoComplete={isSignUp ? 'email' : 'email'}
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="profile-login-password">
          パスワード
        </label>
        <input
          id="profile-login-password"
          type="password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isSignUp ? '6文字以上' : undefined}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          disabled={loading}
        />
      </div>
      {error && <p className="form-message form-message--error">{error}</p>}
      {signUpMessage && <p className="form-message form-message--accent">{signUpMessage}</p>}
      <div className="modal-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (isSignUp ? '作成中…' : 'ログイン中…') : isSignUp ? 'アカウントを作成' : 'ログイン'}
        </button>
        {showCloseButton && (
          <button type="button" className="btn btn-ghost" onClick={() => onSuccess()} aria-label="閉じる">
            閉じる（ログインしない）
          </button>
        )}
      </div>
    </form>
  )
}
