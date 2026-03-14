import { useState, useCallback } from 'react'
import { insertUser, fetchUsers } from '../api'

export default function SettingsModal({
  theme,
  setTheme,
  onClose,
  users,
  setUsers,
  notifyReminderEnabled,
  setNotifyReminderEnabled,
  addToast,
}) {
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [addingUser, setAddingUser] = useState(false)

  const handleAddUser = useCallback(async () => {
    const name = newUserName.trim()
    if (!name) return
    setAddingUser(true)
    try {
      await insertUser({
        id: `u-${crypto.randomUUID()}`,
        name,
        email: newUserEmail.trim() || null,
        avatarUrl: '',
        created: Date.now(),
      })
      const list = await fetchUsers()
      setUsers(list)
      setNewUserName('')
      setNewUserEmail('')
      addToast('✅', 'メンバーを追加しました', name)
    } catch (e) {
      addToast('❌', '追加できませんでした', e?.message ?? 'tf_users テーブルを確認してください')
    } finally {
      setAddingUser(false)
    }
  }, [newUserName, newUserEmail, setUsers, addToast])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">設定</h2>
        <div className="form-group">
          <span className="form-label">表示モード</span>
          <div className="theme-toggle mt-8">
            <span className="theme-toggle__label">{theme === 'dark' ? 'ダーク' : 'ライト'}</span>
            <button
              type="button"
              className="theme-toggle__switch"
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            />
          </div>
        </div>

        <div className="form-group mt-24">
          <span className="form-label">チームメンバー</span>
          <p className="form-hint">タスクの担当者として選べるメンバーを追加します。</p>
          <ul className="settings-category-list" aria-label="チームメンバー">
            {users.length === 0 ? (
              <li className="settings-category-empty">メンバーがいません。追加するとタスクに担当者を割り当てられます。</li>
            ) : (
              users.map((u) => (
                <li key={u.id} className="settings-category-item">
                  <span className="settings-user-avatar">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt="" width={24} height={24} className="rounded-circle" />
                    ) : (
                      '👤'
                    )}
                  </span>
                  <span>
                    {u.name}
                    {u.email ? ` (${u.email})` : ''}
                  </span>
                </li>
              ))
            )}
          </ul>
          <div className="settings-category-add">
            <input
              type="text"
              className="form-input"
              placeholder="表示名"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
              aria-label="メンバー名"
            />
            <input
              type="email"
              className="form-input"
              placeholder="メール（任意）"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
              aria-label="メール"
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddUser}
              disabled={addingUser || !newUserName.trim()}
            >
              {addingUser ? '追加中…' : '追加'}
            </button>
          </div>
        </div>

        <div className="form-group mt-24">
          <span className="form-label">通知</span>
          <div className="theme-toggle mt-8">
            <span className="theme-toggle__label">期限リマインダー（今日が期限のタスクをお知らせ）</span>
            <button
              type="button"
              className="theme-toggle__switch"
              aria-pressed={notifyReminderEnabled}
              onClick={() => setNotifyReminderEnabled((v) => !v)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}
