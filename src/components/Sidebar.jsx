import { formatTodayDisplay } from '../utils'
import { AppIcon } from './AppIcons'
import { LegalLinks } from './LegalLinks'

const SIDEBAR_MENU_ITEMS = [
  { key: 'projects', icon: 'projects', label: 'プロジェクト' },
  { key: 'all', icon: 'all', label: 'すべてのタスク' },
  { key: 'week-tasks', icon: 'today', label: '今週タスク', badgeKey: 'todayCount' },
  { key: 'daily-today', icon: 'sun', label: '今日・明日', isDailyPlanner: true },
  { key: 'overdue', icon: 'warning', label: '期限超過', badgeKey: 'overdueCount' },
  { key: 'kanban', icon: 'kanban', label: 'カンバン' },
  { key: 'dashboard', icon: 'dashboard', label: 'ダッシュボード' },
  { key: 'gantt', icon: 'gantt', label: 'タイムライン' },
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
          <div className="sidebar-notif-box__title">
            <span className="sidebar-inline-icon" aria-hidden>
              <AppIcon name="bell" />
            </span>
            通知を有効化
          </div>
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
          const isActive =
            item.isDailyPlanner === true
              ? view === 'daily-today' || view === 'daily-tomorrow'
              : view === item.key
          return (
            <button
              key={item.key}
              type="button"
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                setView(item.key)
                setSidebarOpen(false)
              }}
            >
              <span className="icon" aria-hidden>
                <AppIcon name={item.icon} />
              </span>
              <span className="sidebar-item__label">{item.label}</span>
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
              <span className="sidebar-item__label">{p.name}</span>
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
          <span className="icon" aria-hidden><AppIcon name="projects" /></span>
          <span className="sidebar-item__label">プロジェクト管理</span>
        </button>
        <button
          type="button"
          className={`sidebar-item ${view === 'templates' ? 'active' : ''}`}
          onClick={() => {
            setView('templates')
            setSidebarOpen(false)
          }}
        >
          <span className="icon" aria-hidden><AppIcon name="templates" /></span>
          <span className="sidebar-item__label">テンプレート</span>
        </button>
        <button
          type="button"
          className={`sidebar-item ${view === 'boss-feedback' ? 'active' : ''}`}
          onClick={() => {
            setView('boss-feedback')
            setSidebarOpen(false)
          }}
        >
          <span className="icon" aria-hidden><AppIcon name="boss-feedback" /></span>
          <span className="sidebar-item__label">上司の指摘</span>
        </button>
        <button
          type="button"
          className={`sidebar-item ${view === 'mail-tracker' ? 'active' : ''}`}
          onClick={() => {
            setView('mail-tracker')
            setSidebarOpen(false)
          }}
        >
          <span className="icon" aria-hidden><AppIcon name="mail-tracker" /></span>
          <span className="sidebar-item__label">未返信</span>
        </button>
        <button
          type="button"
          className={`sidebar-item ${view === 'clients' || view.startsWith('c:') ? 'active' : ''}`}
          onClick={() => {
            setView('clients')
            setSidebarOpen(false)
          }}
        >
          <span className="icon" aria-hidden><AppIcon name="remember" /></span>
          <span className="sidebar-item__label">覚えておくこと</span>
        </button>
        <button
          type="button"
          className={`sidebar-item ${view === 'categories' ? 'active' : ''}`}
          onClick={() => {
            setView('categories')
            setSidebarOpen(false)
          }}
        >
          <span className="icon" aria-hidden><AppIcon name="categories" /></span>
          <span className="sidebar-item__label">カテゴリ</span>
        </button>
        <button
          type="button"
          className={`sidebar-item ${view === 'materials' ? 'active' : ''}`}
          onClick={() => {
            setView('materials')
            setSidebarOpen(false)
          }}
        >
          <span className="icon" aria-hidden><AppIcon name="materials" /></span>
          <span className="sidebar-item__label">教材集</span>
        </button>
        <button
          type="button"
          className={`sidebar-item ${view === 'weekly-review' ? 'active' : ''}`}
          onClick={() => {
            setView('weekly-review')
            setSidebarOpen(false)
          }}
        >
          <span className="icon" aria-hidden><AppIcon name="review" /></span>
          <span className="sidebar-item__label">週のふりかえり</span>
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
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt="" />
                ) : (
                  <span className="sidebar-team-avatar__fallback" aria-hidden>
                    <AppIcon name="user" />
                  </span>
                )}
              </button>
            ))
          )}
        </div>
        <button type="button" className="sidebar-item" onClick={() => { onOpenSettings(); setSidebarOpen(false) }}>
          <span className="icon" aria-hidden><AppIcon name="settings" /></span>
          <span className="sidebar-item__label">設定</span>
        </button>
        <button type="button" className="sidebar-item sidebar-item--logout" onClick={() => { onOpenProfile(); setSidebarOpen(false) }}>
          <span className="icon" aria-hidden><AppIcon name="logout" /></span>
          <span className="sidebar-item__label">ログアウト</span>
        </button>
      </div>
      <div className="sidebar-bottom">
        <button type="button" className="btn btn-ghost btn-sm w-100" onClick={onShowMorning}>
          <span className="sidebar-inline-icon" aria-hidden>
            <AppIcon name="sun" />
          </span>
          朝の確認を表示
        </button>
        <LegalLinks className="sidebar-legal-links" />
      </div>
    </aside>
  )
}
