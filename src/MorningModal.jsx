import { PRIORITY } from './constants'
import { isToday, isOverdue, formatDate } from './utils'

export default function MorningModal({ tasks, projects, onClose }) {
  const todayTasks = tasks.filter(t => !t.done && (isToday(t.due) || isOverdue(t.due)))
  const show = todayTasks.length > 0 ? todayTasks : tasks.filter(t => !t.done).slice(0, 5)

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'おはようございます' : 'こんにちは'
  const dateStr = now.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })

  return (
    <div className="morning-overlay">
      <div className="morning-header">
        <div style={{ fontSize:'13px', color:'var(--text-muted)', letterSpacing:'2px', marginBottom:'8px', textTransform:'uppercase', fontFamily:'Sora,sans-serif' }}>GOOD MORNING</div>
        <h1>{greeting} <span className="accent-glow-text">☀️</span></h1>
        <div className="date">{dateStr} — 今日のタスク確認</div>
      </div>

      <div className="morning-tasks">
        {show.length === 0 ? (
          <div className="morning-empty">🎉 今日のタスクはありません！</div>
        ) : show.map(t => {
          const proj = projects.find(p => p.id === t.projectId)
          return (
            <div key={t.id} className="morning-task">
              <div className="dot" style={{ background: PRIORITY[t.priority].color }} />
              <div style={{ flex: 1 }}>
                <div className="morning-task-title">{t.title}</div>
                <div className="morning-task-meta">
                  {proj && <span className="morning-task-proj">{proj.icon} {proj.name}</span>}
                  {t.due && <span className={`morning-task-due ${isOverdue(t.due) ? 'overdue' : isToday(t.due) ? 'today' : ''}`}>📅 {formatDate(t.due)}</span>}
                </div>
              </div>
              <div style={{ fontSize:'11px', background:`${PRIORITY[t.priority].color}20`, color:PRIORITY[t.priority].color, padding:'2px 8px', borderRadius:'4px', fontFamily:'Sora,sans-serif', fontWeight:'700' }}>
                {PRIORITY[t.priority].label}
              </div>
            </div>
          )
        })}
      </div>

      <button className="btn btn-primary" style={{ fontSize:'15px', padding:'12px 40px' }} onClick={onClose}>
        開始する →
      </button>
    </div>
  )
}
