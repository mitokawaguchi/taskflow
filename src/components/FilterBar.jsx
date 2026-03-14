import { PRIORITY, SORT_OPTIONS, PRIORITY_KEYS } from '../constants'

const PRIORITY_OPTIONS = Object.entries(PRIORITY).map(([key, { label }]) => ({ key, label }))

export default function FilterBar({
  filterOpen,
  setFilterOpen,
  hasAnyFilter,
  filterProjectIds,
  setFilterProjectIds,
  filterPriorities,
  setFilterPriorities,
  filterAssigneeId,
  setFilterAssigneeId,
  filterDueFrom,
  setFilterDueFrom,
  filterDueTo,
  setFilterDueTo,
  filterPriorityFrom,
  setFilterPriorityFrom,
  filterPriorityTo,
  setFilterPriorityTo,
  sort,
  setSort,
  projects,
  users,
}) {
  return (
    <>
      <button
        type="button"
        className="filter-toggle"
        onClick={() => setFilterOpen((o) => !o)}
        aria-expanded={filterOpen}
      >
        {filterOpen ? '絞り込み・ソート ▲' : '絞り込み・ソート ▼'}
        {hasAnyFilter && <span className="filter-toggle-badge">条件あり</span>}
      </button>
      {filterOpen && (
        <>
          <div className="filter-bar">
            <span className="sort-label">絞り込み</span>
            <div className="filter-group filter-group--project">
              <span className="filter-group-label">プロジェクト:</span>
              <button
                type="button"
                className={`sort-chip ${filterProjectIds.length === 0 ? 'active' : ''}`}
                onClick={() => setFilterProjectIds([])}
              >
                すべて
              </button>
              {projects.map((p) => {
                const on = filterProjectIds.includes(p.id)
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`sort-chip ${on ? 'active' : ''}`}
                    onClick={() => setFilterProjectIds((prev) => (on ? prev.filter((id) => id !== p.id) : [...prev, p.id]))}
                    title={p.name}
                  >
                    {p.icon} {p.name}
                  </button>
                )
              })}
            </div>
            <div className="filter-group filter-group--project">
              <span className="filter-group-label">担当者:</span>
              <button
                type="button"
                className={`sort-chip ${!filterAssigneeId ? 'active' : ''}`}
                onClick={() => setFilterAssigneeId('')}
              >
                すべて
              </button>
              {users.map((u) => {
                const on = filterAssigneeId === u.id
                return (
                  <button
                    key={u.id}
                    type="button"
                    className={`sort-chip ${on ? 'active' : ''}`}
                    onClick={() => setFilterAssigneeId((prev) => (prev === u.id ? '' : u.id))}
                    title={u.name}
                  >
                    {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="avatar-sm" /> : '👤'}
                    {u.name}
                  </button>
                )
              })}
            </div>
            <div className="filter-group">
              <span className="filter-group-label">優先度:</span>
              <button
                type="button"
                className={`sort-chip ${filterPriorities.length === 0 ? 'active' : ''}`}
                onClick={() => setFilterPriorities([])}
              >
                すべて
              </button>
              {PRIORITY_OPTIONS.map((opt) => {
                const on = filterPriorities.includes(opt.key)
                return (
                  <button
                    key={opt.key}
                    type="button"
                    className={`sort-chip ${on ? 'active' : ''}`}
                    onClick={() =>
                      setFilterPriorities((prev) => (on ? prev.filter((k) => k !== opt.key) : [...prev, opt.key]))
                    }
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="sort-bar">
            <span className="sort-label">ソート:</span>
            {SORT_OPTIONS.map((s) => (
              <button
                key={s.key}
                className={`sort-chip ${sort === s.key ? 'active' : ''}`}
                onClick={() => setSort(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
          {(sort === 'due' || sort === 'priority') && (
            <div className="filter-bar sort-filter-bar">
              {sort === 'due' && (
                <div className="filter-group">
                  <span className="filter-group-label">期限:</span>
                  <label className="filter-range-label">
                    いつから
                    <input
                      type="date"
                      className="form-input filter-date"
                      value={filterDueFrom}
                      onChange={(e) => setFilterDueFrom(e.target.value)}
                    />
                  </label>
                  <span className="filter-range-sep">〜</span>
                  <label className="filter-range-label">
                    いつまで
                    <input
                      type="date"
                      className="form-input filter-date"
                      value={filterDueTo}
                      onChange={(e) => setFilterDueTo(e.target.value)}
                    />
                  </label>
                </div>
              )}
              {sort === 'priority' && (
                <div className="filter-group">
                  <span className="filter-group-label">重要度ランク:</span>
                  <label className="filter-range-label">
                    から
                    <select
                      className="form-input filter-select"
                      value={filterPriorityFrom}
                      onChange={(e) => setFilterPriorityFrom(e.target.value)}
                    >
                      <option value="">指定なし</option>
                      {PRIORITY_KEYS.map((k) => (
                        <option key={k} value={k}>
                          {PRIORITY[k].label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span className="filter-range-sep">〜</span>
                  <label className="filter-range-label">
                    まで
                    <select
                      className="form-input filter-select"
                      value={filterPriorityTo}
                      onChange={(e) => setFilterPriorityTo(e.target.value)}
                    >
                      <option value="">指定なし</option>
                      {PRIORITY_KEYS.map((k) => (
                        <option key={k} value={k}>
                          {PRIORITY[k].label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </>
  )
}
