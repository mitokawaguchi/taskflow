/**
 * メインエリアのトップバー（戻る・タイトル・タブ・テーマ・フィルター・検索・アクション）
 * ARCH-001: App.jsx 200行以下化のため抽出
 */
export default function TopBar({
  view,
  isProjectView,
  setView,
  viewTitle,
  viewTabs,
  isMainView,
  theme,
  setTheme,
  setSidebarOpen,
  setFilterOpen,
  activeFilterCount,
  searchQuery,
  setSearchQuery,
  todayCount,
  overdueCount,
  onShowMorning,
  onShowProfile,
  showDone,
  setShowDone,
  onAddTask,
}) {
  return (
    <div className="topbar">
      {(isProjectView || view.startsWith('c:') || view.startsWith('n:')) && (
        <button
          type="button"
          className="btn btn-ghost btn-sm topbar-back"
          onClick={() => {
            if (view.startsWith('n:')) setView('notes')
            else setView(isProjectView ? 'projects' : 'clients')
          }}
          aria-label={view.startsWith('n:') ? 'メモ一覧に戻る' : '一覧に戻る'}
        >
          ← 戻る
        </button>
      )}
      <button type="button" className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="メニュー">
        ☰
      </button>
      <div className="topbar-title">{viewTitle()}</div>

      {isMainView && (
        <div className="topbar-tabs" role="tablist" aria-label="ビュー切替">
          {viewTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={view === tab.key}
              className={`topbar-tab ${view === tab.key ? 'topbar-tab--active' : ''}`}
              onClick={() => setView(tab.key)}
            >
              <span className="topbar-tab__icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="topbar-right">
        <div className="theme-toggle" role="group" aria-label="表示モード">
          <span className="theme-toggle__label">{theme === 'dark' ? 'ダーク' : 'ライト'}</span>
          <button
            type="button"
            className="theme-toggle__switch"
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'dark' ? 'ダークモード（クリックでライトに）' : 'ライトモード（クリックでダークに）'}
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          />
        </div>
        {view !== 'clients' && !view.startsWith('c:') && view !== 'notes' && !view.startsWith('n:') && (
          <>
            {(view === 'all' || view === 'today' || view === 'overdue') && (
              <>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm topbar-filter-btn"
                  onClick={() => setFilterOpen((o) => !o)}
                  aria-label="フィルター"
                >
                  フィルター
                  {activeFilterCount > 0 && <span className="topbar-filter-badge">{activeFilterCount}</span>}
                </button>
                <label className="topbar-search-wrap">
                  <span className="topbar-search-icon" aria-hidden>
                    🔍
                  </span>
                  <input
                    type="search"
                    className="topbar-search"
                    placeholder="タスクを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="タスクを検索"
                  />
                </label>
              </>
            )}
            <button
              type="button"
              className="topbar-icon-btn"
              onClick={onShowMorning}
              aria-label="通知"
              title="今日のタスク・朝の確認"
            >
              🔔
              {(todayCount > 0 || overdueCount > 0) && <span className="topbar-icon-dot" />}
            </button>
            <button
              type="button"
              className="topbar-avatar"
              onClick={onShowProfile}
              aria-label="プロフィール・設定"
              title="プロフィール"
            >
              👤
            </button>
          </>
        )}
        {view !== 'clients' && !view.startsWith('c:') && view !== 'projects' && view !== 'categories' && view !== 'boss-feedback' && view !== 'mail-tracker' && view !== 'notes' && !view.startsWith('n:') && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowDone(!showDone)}>
            {showDone ? '完了を非表示' : '完了を表示'}
          </button>
        )}
        {!isProjectView && view !== 'projects' && view !== 'templates' && view !== 'boss-feedback' && view !== 'mail-tracker' && view !== 'clients' && !view.startsWith('c:') && view !== 'notes' && !view.startsWith('n:') && (
          <button type="button" className="btn btn-primary" onClick={onAddTask}>
            + 追加
          </button>
        )}
      </div>
    </div>
  )
}
