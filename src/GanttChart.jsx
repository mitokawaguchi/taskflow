import { useMemo, useState } from 'react'
import { today, formatDate } from './utils'

const ROW_HEIGHT = 36
const DAY_WIDTH = 28

export default function GanttChart({ tasks, projects }) {
  const [range, setRange] = useState('week') // 'day' | 'week' | 'month'

  const { startDate, endDate, days } = useMemo(() => {
    const now = new Date(today())
    let start, end
    if (range === 'day') {
      start = new Date(now)
      end = new Date(now)
      end.setDate(end.getDate() + 6)
    } else if (range === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else {
      const d = now.getDay()
      const mon = new Date(now)
      mon.setDate(mon.getDate() - (d === 0 ? 6 : d - 1))
      start = mon
      end = new Date(mon)
      end.setDate(end.getDate() + 6)
    }
    const days = []
    const cur = new Date(start)
    while (cur <= end) {
      days.push(cur.toISOString().slice(0, 10))
      cur.setDate(cur.getDate() + 1)
    }
    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      days,
    }
  }, [range])

  const todayStr = today()
  const tasksWithDue = useMemo(() => {
    return tasks
      .filter(t => t.due && t.due >= startDate && t.due <= endDate)
      .slice(0, 30)
  }, [tasks, startDate, endDate])

  return (
    <div className="gantt">
      <div className="gantt-toolbar">
        <span className="gantt-toolbar__label">表示:</span>
        {['day', 'week', 'month'].map(r => (
          <button
            key={r}
            type="button"
            className={`btn btn-ghost btn-sm ${range === r ? 'active' : ''}`}
            onClick={() => setRange(r)}
          >
            {r === 'day' ? '日' : r === 'week' ? '週' : '月'}
          </button>
        ))}
      </div>
      <div className="gantt-scroll">
        <div
          className="gantt-grid"
          style={{
            gridTemplateColumns: `200px repeat(${days.length}, ${DAY_WIDTH}px)`,
            gridTemplateRows: `auto repeat(${tasksWithDue.length}, ${ROW_HEIGHT}px)`,
          }}
        >
          <div className="gantt-head gantt-head--label">タスク</div>
          {days.map(d => (
            <div key={d} className={`gantt-head ${d === todayStr ? 'today' : ''}`}>{formatDate(d)}</div>
          ))}
          {tasksWithDue.flatMap(t => {
            const proj = projects.find(p => p.id === t.projectId)
            return [
              <div key={`${t.id}-l`} className="gantt-cell gantt-cell--label">
                <span className="gantt-cell__title">{t.title}</span>
                {proj && <span className="gantt-cell__proj" style={{ color: proj.color }}>{proj.icon}</span>}
              </div>,
              ...days.map(d => (
                <div key={`${t.id}-${d}`} className={`gantt-cell ${d === todayStr ? 'today' : ''}`}>
                  {t.due === d && (
                    <div
                      className="gantt-bar"
                      style={{ background: proj?.color || 'var(--accent)' }}
                      title={`${t.title} — ${formatDate(t.due)}`}
                    />
                  )}
                </div>
              )),
            ]
          })}
        </div>
      </div>
    </div>
  )
}
