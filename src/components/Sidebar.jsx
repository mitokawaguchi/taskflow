import { formatTodayDisplay } from '../utils'
import { LegalLinks } from './LegalLinks'

const SIDEBAR_MENU_ITEMS = [
  { key: 'projects', icon: '📁', label: 'プロジェクト' },
  { key: 'all', icon: '📋', label: 'すべてのタスク' },
  { key: 'today', icon: '☀️', label: '今日', badgeKey: 'todayCount' },
  { key: 'overdue', icon: '🚨', label: '期限超過', badgeKey: 'overdueCount' },
  { key: 'kanban', icon: '📌', label: 'カンバン' },
  { key: 'dashboard', icon: '📊', label: 'ダッシュボード' },
  { key: 'gantt', icon: '📅', label: 'タイムライン' },
]

export default function Sidebar({
  tasks,
  projects,
  users,
  view,
  setView,
  todayCount,
  overdueCount,
  sidebarOpen,
  setSidebarOpen,
  sidebarProjectsOpen,
  setSidebarProjectsOpen,
  notifGranted,
  requestNotif,
  onAddProject,
  filterAssigneeId,
  setFilterAssigneeId,
  setFilterOpen,
  onOpenSettings,
  onOpenProfile,
  onShowMorning,
}) {
  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <img
            src="/logo.png"
            alt=""
            className="logo-icon"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = '/logo.svg'
            }}
          />
          <span className="logo-text">Task<span>Flow</span></span>
        </div>
        <div className="sidebar-today">
          <span className="sidebar-today-label">今日</span>
          <span className="sidebar-today-date">{formatTodayDisplay()}</span>
        </div>
        <div className="sidebar-task-count">{tasks.filter((t) => !t.done).length} 件のタスク</div>
      </div>

      {!notifGranted && (
        <div className="sidebar-notif-box">
          <div className="sidebar-notif-box__title">🔔 通知を有効化</div>
          <p className="sidebar-notif-box__p">
            アプリを開いたときに「今日が期限」のタスクがあれば通知します。スマホではバックグラウンド通知には未対応です。
          </p>
          <button type="button" className="btn btn-primary btn-sm w-100" onClick={requestNotif}>
            許可する
          </button>
        </div>
      )}

      <div className="sidebar-section sidebar-section--pb8">
        <div className="sidebar-label">メニュー</div>
        {SIDEBAR_MENU_ITEMS.map((item) => {
          const badge = item.badgeKey === 'todayCount' ? todayCount : item.badgeKey === 'overdueCount' ? overdueCount : 0
          const allTaskCount = item.key === 'all' ? tasks.filter((t) => !t.done).length : null
          return (
            <button
              key={item.key}
              type="button"
              className={`sidebar-item ${view === item.key ? 'active' : ''}`}
              onClick={() => {
                setView(item.key)
                setSidebarOpen(false)
              }}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
              {item.key === 'all' && <span className="sidebar-item-count">{allTaskCount}</span>}
              {badge > 0 && <span className="badge">{badge}</span>}
            </button>
          )
        })}
      </div>

      <div className="sidebar-section">
        <div
          className="sidebar-label sidebar-label--with-toggle"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '8px' }}
        >
          <button
            type="button"
            className="sidebar-project-toggle"
            onClick={() => setSidebarProjectsOpen((o) => !o)}
            aria-expanded={sidebarProjectsOpen}
          >
            {sidebarProjectsOpen ? 'プロジェクト ▲' : 'プロジェクト ▼'}
          </button>
          <button type="button" className="sidebar-add-proj" onClick={onAddProject} aria-label="プロジェクト追加">
            +
          </button>
        </div>
        {sidebarProjectsOpen &&
          projects.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`sidebar-item ${view === `p:${p.id}` ? 'active' : ''}`}
              onClick={() => {
                setView(`p:${p.id}`)
                setSidebarOpen(false)
              }}
            >
              <span className="project-dot" style={{ background: p.color }} />
              <span className="sidebar-item__label">{p.icon} {p.name}</span>
              <span className="sidebar-item__count">{tasks.filter((t) => t.projectId === p.id && !t.done).length}</span>
            </button>
          ))}
      </div>

      <div className="sidebar-section sidebar-section--mt4">
        <div className="sidebar-label">その他</div>
        <button
          type="button"
          className={`sidebar-item ${view === 'projects' ? 'active' : ''}`}
          onClick={() => {
            setView('projects')
            setSidebarOpen(false)
          }}
        >
          <span className="icon">🗂</span>プロジェクト管理
        </button>
        <button
          type="button"
          className={`sidebar-item ${view === 'templates' ? 'active' : ''}`}
          onClick={() => {
            setView('templates')
            setSidebarOpen(false)
          }}
        >
          <span className="icon">📋</span>テンプレート
        </button>
        <button
          type="button"
          className={`sidebar-item ${view === 'boss-feedback' ? 'active' : ''}`}
          onClick={() => {
            setView('boss-feedback')
            setSidebarOpen(false)
          }}
        >
          <span className="icon">📝</span>上司の指摘
        </button>
        <button
          type="button"
          className={`sidebar-item ${view === 'mail-tracker' ? 'active' : ''}`}
          onClick={() => {
            setView('mail-tracker')
            setSidebarOpen(false)
          }}
        >
          <span className="icon">✉️</span>未返信
        </button>
        <button
          type="button"
          className={`sidebar-item ${view === 'clients' || view.startsWith('c:') ? 'active' : ''}`}
          onClick={() => {
            setView('clients')
            setSidebarOpen(false)
          }}
        >
          <span className="icon">📌</span>覚えておくこと
        </button>
        <button
          type="button"
          className={`sidebar-item ${view === 'categories' ? 'active' : ''}`}
          onClick={() => {
            setView('categories')
            setSidebarOpen(false)
          }}
        >
          <span className="icon">🏷</span>カテゴリ
        </button>
        <button
          type="button"
          className={`sidebar-item ${view === 'materials' ? 'active' : ''}`}
          onClick={() => {
            setView('materials')
            setSidebarOpen(false)
          }}
        >
          <span className="icon">📚</span>教材集
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-label">チーム</div>
        <div className="sidebar-team-avatars" aria-label="チームメンバー">
          {users.length === 0 ? (
            <span className="sidebar-team-placeholder">設定でメンバーを追加</span>
          ) : (
            users.slice(0, 12).map((u) => (
              <button
                key={u.id}
                type="button"
                className={`sidebar-team-avatar ${filterAssigneeId === u.id ? 'active' : ''}`}
                onClick={() => {
                  setFilterAssigneeId((prev) => (prev === u.id ? '' : u.id))
                  setView('all')
                  setFilterOpen(true)
                  setSidebarOpen(false)
                }}
                title={`${u.name}で絞り込み`}
                aria-label={`${u.name}で絞り込み`}
              >
                {u.avatarUrl ? <img src={u.avatarUrl} alt="" /> : <span>👤</span>}
              </button>
            ))
          )}
        </div>
        <button type="button" className="sidebar-item" onClick={() => { onOpenSettings(); setSidebarOpen(false) }}>
          <span className="icon">⚙️</span>設定
        </button>
        <button type="button" className="sidebar-item sidebar-item--logout" onClick={() => { onOpenProfile(); setSidebarOpen(false) }}>
          <span className="icon">🚪</span>ログアウト
        </button>
      </div>
      <div className="sidebar-bottom">
        <button type="button" className="btn btn-ghost btn-sm w-100" onClick={onShowMorning}>
          ☀️ 朝の確認を表示
        </button>
        <LegalLinks className="sidebar-legal-links" />
      </div>
    </aside>
  )
}
