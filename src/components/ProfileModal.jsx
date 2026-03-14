import { useState, useEffect } from 'react'
import { ProfileLoginForm } from './LoginScreen'
import { updateAuthUserMetadata, updateAuthPassword, signOut } from '../api'

export default function ProfileModal({ authUser, onClose, addToast, setAuthUser }) {
  const [displayName, setDisplayName] = useState(
    authUser?.user_metadata?.display_name ?? ''
  )
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setDisplayName(authUser?.user_metadata?.display_name ?? '')
  }, [authUser])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">プロフィール・ログイン</h2>
        {authUser ? (
          <>
            <p className="text-muted-14-mb16">
              ログイン中: <strong>{authUser.email ?? authUser.id}</strong>
            </p>
            <div className="profile-settings">
              <h3 className="profile-settings__title">プロフィール設定</h3>
              <div className="form-group">
                <label className="form-label" htmlFor="profile-display-name">
                  表示名（任意）
                </label>
                <input
                  id="profile-display-name"
                  type="text"
                  className="form-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="表示名"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 6 }}
                  disabled={loading}
                  onClick={async () => {
                    setError('')
                    setLoading(true)
                    try {
                      await updateAuthUserMetadata({
                        display_name: displayName.trim() || undefined,
                      })
                      addToast('✅', '保存しました', '表示名を更新しました')
                    } catch (e) {
                      setError(e?.message ?? '保存に失敗しました')
                    } finally {
                      setLoading(false)
                    }
                  }}
                >
                  保存
                </button>
              </div>
              <div className="form-group mt-16">
                <label className="form-label" htmlFor="profile-new-password">
                  パスワードを変更
                </label>
                <input
                  id="profile-new-password"
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="新しいパスワード（6文字以上）"
                  disabled={loading}
                />
                <input
                  type="password"
                  className="form-input"
                  style={{ marginTop: 6 }}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="確認"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm mt-6"
                  disabled={
                    loading || !newPassword || !confirmPassword
                  }
                  onClick={async () => {
                    setError('')
                    if (newPassword.length < 6) {
                      setError('パスワードは6文字以上にしてください')
                      return
                    }
                    if (newPassword !== confirmPassword) {
                      setError('確認が一致しません')
                      return
                    }
                    setLoading(true)
                    try {
                      await updateAuthPassword(newPassword)
                      setNewPassword('')
                      setConfirmPassword('')
                      addToast('✅', 'パスワードを変更しました', '')
                    } catch (e) {
                      setError(e?.message ?? '変更に失敗しました')
                    } finally {
                      setLoading(false)
                    }
                  }}
                >
                  パスワードを変更
                </button>
              </div>
              {error && (
                <p className="form-message form-message--error mt-8">
                  {error}
                </p>
              )}
            </div>
            <div className="modal-actions modal-actions--wrap">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={async () => {
                  onClose()
                  try {
                    await signOut()
                    setAuthUser(null)
                  } catch (e) {
                    addToast('❌', 'ログアウトに失敗しました', e?.message ?? '')
                  }
                }}
              >
                ログアウト
              </button>
              <button type="button" className="btn btn-primary" onClick={onClose}>
                閉じる
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="form-message">外側をクリックしても閉じられます。</p>
            <ProfileLoginForm onSuccess={onClose} onError={addToast} />
          </>
        )}
      </div>
    </div>
  )
}
