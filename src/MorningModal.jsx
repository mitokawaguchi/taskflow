import { getPriorityLabel, getPriorityColor } from './constants'
import { isToday, isTomorrow, isOverdue, formatDate } from './utils'

export default function MorningModal({ tasks, projects, onClose }) {
  const show = tasks.filter(t => !t.done && (isToday(t.due) || isOverdue(t.due)))

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'おはようございます' : 'こんにちは'
  const dateStr = now.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })

  return (
    <div className="morning-overlay">
      <div className="morning-header">
        <div className="morning-header__badge">GOOD MORNING</div>
        <h1>{greeting} <span className="accent-glow-text">☀️</span></h1>
        <div className="date">{dateStr} — 今日のタスク確認</div>
      </div>

      <div className="morning-tasks">
        {show.length === 0 ? (
          <div className="morning-empty">🎉 今日のタスクはありません！</div>
        ) : show.map(t => {
          const proj = projects.find(p => p.id === t.projectId)
          return (
            <div key={t.id} className={`morning-task ${isOverdue(t.due) ? 'morning-task--overdue' : ''}`}>
              <div className="dot" style={{ background: isOverdue(t.due) ? 'var(--critical)' : getPriorityColor(t.priority) }} />
              <div className="morning-task__body">
                <div className="morning-task-title">{t.title}</div>
                <div className="morning-task-meta">
                  {proj && <span className="morning-task-proj">{proj.icon} {proj.name}</span>}
                  {t.due && (
                    <span className={`morning-task-due ${isOverdue(t.due) ? 'overdue' : isToday(t.due) || isTomorrow(t.due) ? 'today-or-tomorrow' : ''}`}>
                      {isOverdue(t.due) ? '🚨 期限超過 ' : ''}{formatDate(t.due)}
                    </span>
                  )}
                </div>
              </div>
              {isOverdue(t.due) ? (
                <span className="morning-task-overdue-badge">期限超過</span>
              ) : (
                <div style={{ fontSize:'11px', background:`${getPriorityColor(t.priority)}20`, color: getPriorityColor(t.priority), padding:'2px 8px', borderRadius:'4px', fontFamily:'Sora,sans-serif', fontWeight:'700' }}>
                  {getPriorityLabel(t.priority)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button className="btn btn-primary morning-btn" onClick={onClose}>
        開始する →
      </button>
    </div>
  )
}
