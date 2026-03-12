import { ProfileLoginForm } from './LoginScreen'
import { updateAuthUserMetadata, updateAuthPassword, signOut } from '../api'

export default function ProfileModal({
  authUser,
  profileDisplayName,
  setProfileDisplayName,
  profileNewPassword,
  setProfileNewPassword,
  profileConfirmPassword,
  setProfileConfirmPassword,
  profileLoading,
  setProfileLoading,
  profileError,
  setProfileError,
  onClose,
  addToast,
  setAuthUser,
}) {
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
                  value={profileDisplayName}
                  onChange={(e) => setProfileDisplayName(e.target.value)}
                  placeholder="表示名"
                  disabled={profileLoading}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: 6 }}
                  disabled={profileLoading}
                  onClick={async () => {
                    setProfileError('')
                    setProfileLoading(true)
                    try {
                      await updateAuthUserMetadata({
                        display_name: profileDisplayName.trim() || undefined,
                      })
                      addToast('✅', '保存しました', '表示名を更新しました')
                    } catch (e) {
                      setProfileError(e?.message ?? '保存に失敗しました')
                    } finally {
                      setProfileLoading(false)
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
                  value={profileNewPassword}
                  onChange={(e) => {
                    setProfileNewPassword(e.target.value)
                    setProfileError('')
                  }}
                  placeholder="新しいパスワード（6文字以上）"
                  disabled={profileLoading}
                />
                <input
                  type="password"
                  className="form-input"
                  style={{ marginTop: 6 }}
                  value={profileConfirmPassword}
                  onChange={(e) => {
                    setProfileConfirmPassword(e.target.value)
                    setProfileError('')
                  }}
                  placeholder="確認"
                  disabled={profileLoading}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm mt-6"
                  disabled={
                    profileLoading ||
                    !profileNewPassword ||
                    !profileConfirmPassword
                  }
                  onClick={async () => {
                    setProfileError('')
                    if (profileNewPassword.length < 6) {
                      setProfileError('パスワードは6文字以上にしてください')
                      return
                    }
                    if (profileNewPassword !== profileConfirmPassword) {
                      setProfileError('確認が一致しません')
                      return
                    }
                    setProfileLoading(true)
                    try {
                      await updateAuthPassword(profileNewPassword)
                      setProfileNewPassword('')
                      setProfileConfirmPassword('')
                      addToast('✅', 'パスワードを変更しました', '')
                    } catch (e) {
                      setProfileError(e?.message ?? '変更に失敗しました')
                    } finally {
                      setProfileLoading(false)
                    }
                  }}
                >
                  パスワードを変更
                </button>
              </div>
              {profileError && (
                <p className="form-message form-message--error mt-8">
                  {profileError}
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
