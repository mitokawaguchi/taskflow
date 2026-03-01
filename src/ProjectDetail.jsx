import { SORT_OPTIONS, priorityOrder } from './constants'
import { isOverdue, isToday } from './utils'
import TaskCard from './TaskCard'

export default function ProjectDetail({ project, tasks, projects, onToggle, onEditTask, onAddTask, sort, setSort, showDone }) {
  const allptasks = tasks.filter(t => t.projectId === project.id)
  const ptasks    = allptasks.filter(t => showDone || !t.done)
  const doneCnt   = allptasks.filter(t => t.done).length
  const pct       = allptasks.length ? Math.round(doneCnt / allptasks.length * 100) : 0

  const byCritical = allptasks.filter(t => !t.done && t.priority === 'critical').length
  const byHigh     = allptasks.filter(t => !t.done && t.priority === 'high').length
  const overdueCnt = allptasks.filter(t => !t.done && isOverdue(t.due)).length

  const sorted = [...ptasks].sort((a, b) => {
    if (sort === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority]
    if (sort === 'due')      return (a.due||'9999') < (b.due||'9999') ? -1 : 1
    if (sort === 'created')  return b.created - a.created
    if (sort === 'name')     return a.title.localeCompare(b.title)
    return 0
  })

  return (
    <>
      <div className="proj-detail-header">
        <div className="proj-detail-title">
          <div className="proj-detail-icon" style={{ background: `${project.color}20` }}>{project.icon}</div>
          <div>
            <div className="proj-detail-name">{project.name}</div>
            <div style={{ fontSize:'13px', color:'var(--text-muted)' }}>{allptasks.filter(t=>!t.done).length} 件残り / 全 {allptasks.length} 件</div>
          </div>
          <button className="btn btn-primary" style={{ marginLeft:'auto' }} onClick={onAddTask}>+ タスク追加</button>
        </div>

        <div className="proj-detail-stats">
          <div className="proj-stat">
            <div className="proj-stat-val" style={{ color:'var(--critical)' }}>{byCritical}</div>
            <div className="proj-stat-label">🔴 緊急</div>
          </div>
          <div className="proj-stat">
            <div className="proj-stat-val" style={{ color:'var(--high)' }}>{byHigh}</div>
            <div className="proj-stat-label">🟠 高優先</div>
          </div>
          <div className="proj-stat">
            <div className="proj-stat-val" style={{ color:'var(--critical)' }}>{overdueCnt}</div>
            <div className="proj-stat-label">⚠️ 期限超過</div>
          </div>
          <div className="proj-stat">
            <div className="proj-stat-val" style={{ color: project.color }}>{pct}%</div>
            <div className="proj-stat-label">✅ 完了率</div>
          </div>
        </div>

        <div className="proj-progress-wrap">
          <div className="proj-progress-label">
            <span>進捗</span>
            <span>{doneCnt} / {allptasks.length} 完了</span>
          </div>
          <div className="proj-progress-bar">
            <div className="proj-progress-fill" style={{ width:`${pct}%`, background: project.color }} />
          </div>
        </div>
      </div>

      <div className="sort-bar">
        <span className="sort-label">並び替え:</span>
        {SORT_OPTIONS.map(s => (
          <button key={s.key} className={`sort-chip ${sort===s.key?'active':''}`} onClick={() => setSort(s.key)}>{s.label}</button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✨</div>
          <p>タスクがありません</p>
          <button className="btn btn-primary" onClick={onAddTask}>最初のタスクを追加</button>
        </div>
      ) : (
        <div className="cards-grid">
          {sorted.map(t => (
            <TaskCard key={t.id} task={t} projects={projects} onToggle={onToggle} onClick={() => onEditTask(t)} />
          ))}
        </div>
      )}
    </>
  )
}
