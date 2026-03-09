import { useMemo, useState } from 'react'
import { today, formatDate } from './utils'

const ROW_HEIGHT = 36
const DAY_WIDTH = 28

export default function GanttChart({ tasks, projects, onEditTask }) {
  const [range, setRange] = useState('month') // 'week' | 'month' | 'quarter'

  const { startDate, endDate, days } = useMemo(() => {
    const now = new Date(today())
    let start, end
    if (range === 'week') {
      const d = now.getDay()
      const mon = new Date(now)
      mon.setDate(mon.getDate() - (d === 0 ? 6 : d - 1))
      start = mon
      end = new Date(mon)
      end.setDate(end.getDate() + 6)
    } else if (range === 'quarter') {
      const q = Math.floor(now.getMonth() / 3) + 1
      start = new Date(now.getFullYear(), (q - 1) * 3, 1)
      end = new Date(now.getFullYear(), q * 3, 0)
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
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

  /** プロジェクト順でグループ化（全プロジェクト・全タスクを表示。未設定 → プロジェクト一覧の順） */
  const groupsByProject = useMemo(() => {
    const order = [{ id: '', project: null }]
    for (const p of projects) order.push({ id: p.id, project: p })
    const map = new Map(order.map(o => [o.id, { project: o.project, tasks: [] }]))
    for (const t of tasks) {
      const id = t.projectId || ''
      const g = map.get(id) ?? map.get('')
      if (g) g.tasks.push(t)
    }
    return order.map(o => map.get(o.id))
  }, [tasks, projects])

  const totalRows = groupsByProject.reduce((sum, g) => sum + 1 + g.tasks.length, 0)
  const rowTemplate = `auto repeat(${totalRows}, ${ROW_HEIGHT}px)`

  const [tooltip, setTooltip] = useState(null)

  return (
    <div className="gantt">
      <div className="gantt-toolbar">
        <span className="gantt-toolbar__label">表示:</span>
        {['week', 'month', 'quarter'].map(r => (
          <button
            key={r}
            type="button"
            className={`btn btn-ghost btn-sm ${range === r ? 'active' : ''}`}
            onClick={() => setRange(r)}
          >
            {r === 'week' ? '週' : r === 'month' ? '月' : '3ヶ月'}
          </button>
        ))}
      </div>
      <div className="gantt-scroll">
        <div
          className="gantt-grid"
          style={{
            gridTemplateColumns: `200px repeat(${days.length}, ${DAY_WIDTH}px)`,
            gridTemplateRows: rowTemplate,
          }}
        >
          <div className="gantt-head gantt-head--label">タスク</div>
          {days.map(d => (
            <div key={d} className={`gantt-head ${d === todayStr ? 'today' : ''}`}>{formatDate(d)}</div>
          ))}
          {groupsByProject.flatMap((group) => {
            const proj = group.project
            const projectLabel = proj ? `${proj.icon} ${proj.name}` : 'プロジェクト未設定'
            const projectColor = proj?.color || 'var(--text-muted)'
            return [
              <div key={`ph-${proj?.id ?? 'none'}-l`} className="gantt-cell gantt-cell--label gantt-cell--project" style={{ background: `${projectColor}18`, borderLeftColor: projectColor }}>
                <span className="gantt-cell__project" style={{ color: projectColor }}>{projectLabel}</span>
              </div>,
              ...days.map(d => (
                <div key={`ph-${proj?.id ?? 'none'}-${d}`} className={`gantt-cell gantt-cell--project ${d === todayStr ? 'today' : ''}`} style={{ background: `${projectColor}08` }} />
              )),
              ...group.tasks.flatMap(t => {
                const taskProj = projects.find(p => p.id === t.projectId)
                const handleOpen = () => onEditTask?.(t)
                return [
                  <div
                    key={`${t.id}-l`}
                    className="gantt-cell gantt-cell--label gantt-cell--clickable"
                    onClick={handleOpen}
                    onKeyDown={e => e.key === 'Enter' && handleOpen()}
                    role="button"
                    tabIndex={0}
                    title="クリックでタスクを編集"
                  >
                    <span className="gantt-cell__title">{t.title}</span>
                    {taskProj && <span className="gantt-cell__proj" style={{ color: taskProj.color }}>{taskProj.icon}</span>}
                  </div>,
                  ...days.map((d) => {
                    const taskStart = t.startDate || t.due || todayStr
                    const taskEnd = t.due || todayStr
                    const isInRange = d >= taskStart && d <= taskEnd
                    const isStart = d === taskStart
                    const isEnd = d === taskEnd
                    return (
                      <div
                        key={`${t.id}-${d}`}
                        className={`gantt-cell ${d === todayStr ? 'today' : ''}`}
                        onClick={handleOpen}
                        role="button"
                        tabIndex={0}
                        onMouseEnter={(e) => {
                          if (isInRange) {
                            setTooltip({
                              title: t.title,
                              startDate: taskStart,
                              endDate: taskEnd,
                              status: t.status,
                              x: e.clientX,
                              y: e.clientY,
                            })
                          }
                        }}
                        onMouseMove={(e) => {
                          if (tooltip && tooltip.title === t.title) {
                            setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        {isInRange && (
                          <div
                            className={`gantt-bar ${isStart ? 'gantt-bar--start' : ''} ${isEnd ? 'gantt-bar--end' : ''}`}
                            style={{ background: taskProj?.color || 'var(--accent)' }}
                            title={`${t.title} — ${taskStart !== taskEnd ? `${formatDate(taskStart)} 〜 ` : ''}${formatDate(taskEnd)}（クリックで編集）`}
                          />
                        )}
                      </div>
                    )
                  }),
                ]
              }),
            ]
          })}
        </div>
        {days.includes(todayStr) && (
          <div
            className="gantt-today-line"
            style={{
              left: `calc(200px + ${days.indexOf(todayStr) * DAY_WIDTH}px + ${DAY_WIDTH / 2}px)`,
            }}
          />
        )}
      </div>
      {tooltip && (
        <div className="gantt-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <div className="gantt-tooltip__title">{tooltip.title}</div>
          <div className="gantt-tooltip__date">
            {tooltip.startDate && tooltip.startDate !== tooltip.endDate
              ? `${formatDate(tooltip.startDate)} 〜 ${formatDate(tooltip.endDate)}`
              : formatDate(tooltip.endDate)}
          </div>
          {tooltip.status && (
            <div className="gantt-tooltip__status">状態: {tooltip.status}</div>
          )}
        </div>
      )}
    </div>
  )
}
