import { useMemo, useState, useRef } from 'react'
import { today, formatDate, getWeekStart, getWeekEnd, formatWeekLabel } from './utils'
import GanttTooltip from './components/GanttTooltip'

const ROW_HEIGHT = 36
const DAY_WIDTH = 44
const WEEK_WIDTH = 80

export default function GanttChart({ tasks, projects, projectsMap, onEditTask }) {
  const [range, setRange] = useState('month') // 'week' | 'month' | 'quarter'

  const { days, weeks, isQuarter } = useMemo(() => {
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
    const startStr = start.toISOString().slice(0, 10)
    const endStr = end.toISOString().slice(0, 10)

    if (range === 'quarter') {
      // 3ヶ月表示: 四半期の全週を列に表示（週単位・○月○週目）
      const weekSet = new Set()
      const cur = new Date(start)
      while (cur <= end) {
        weekSet.add(getWeekStart(cur.toISOString().slice(0, 10)))
        cur.setDate(cur.getDate() + 7)
      }
      const weekList = [...weekSet].sort((a, b) => a.localeCompare(b))
      return { days: [], weeks: weekList, isQuarter: true }
    }

    const daysList = []
    const cur = new Date(start)
    while (cur <= end) {
      daysList.push(cur.toISOString().slice(0, 10))
      cur.setDate(cur.getDate() + 1)
    }
    return { days: daysList, weeks: [], isQuarter: false }
  }, [range])

  const todayStr = today()
  /** 今日より過去7日間（今日は含まない） */
  const isPastWeek = (d) => {
    if (d >= todayStr) return false
    const diffDays = Math.round((new Date(todayStr) - new Date(d)) / 86400000)
    return diffDays >= 1 && diffDays <= 7
  }

  const columns = isQuarter ? weeks : days
  const colWidth = isQuarter ? WEEK_WIDTH : DAY_WIDTH

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
  const tooltipRef = useRef(null)

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
            gridTemplateColumns: `200px repeat(${columns.length}, ${colWidth}px)`,
            gridTemplateRows: rowTemplate,
          }}
        >
          <div className="gantt-head gantt-head--label">タスク</div>
          {columns.map((col) => {
            if (isQuarter) {
              const weekEnd = getWeekEnd(col)
              const isTodayCol = todayStr >= col && todayStr <= weekEnd
              const isPastCol = weekEnd < todayStr
              return (
                <div key={col} className={`gantt-head ${isTodayCol ? 'today' : ''} ${isPastCol ? 'past' : ''}`} title={`${formatDate(col)} 〜 ${formatDate(weekEnd)}`}>
                  {formatWeekLabel(col)}
                </div>
              )
            }
            return (
              <div key={col} className={`gantt-head ${col === todayStr ? 'today' : ''} ${isPastWeek(col) ? 'past' : ''}`} title={formatDate(col)}>{formatDate(col)}</div>
            )
          })}
          {groupsByProject.flatMap((group) => {
            const proj = group.project
            const projectLabel = proj ? `${proj.icon} ${proj.name}` : 'プロジェクト未設定'
            const projectColor = proj?.color || 'var(--text-muted)'
            return [
              <div key={`ph-${proj?.id ?? 'none'}-l`} className="gantt-cell gantt-cell--label gantt-cell--project" style={{ background: `${projectColor}18`, borderLeftColor: projectColor }}>
                <span className="gantt-cell__project" style={{ color: projectColor }}>{projectLabel}</span>
              </div>,
              ...columns.map((col) => {
                if (isQuarter) {
                  const weekEnd = getWeekEnd(col)
                  const isTodayCol = todayStr >= col && todayStr <= weekEnd
                  const isPastCol = weekEnd < todayStr
                  return (
                    <div key={`ph-${proj?.id ?? 'none'}-${col}`} className={`gantt-cell gantt-cell--project ${isTodayCol ? 'today' : ''} ${isPastCol ? 'past' : ''}`} style={{ background: `${projectColor}08` }} />
                  )
                }
                return (
                  <div key={`ph-${proj?.id ?? 'none'}-${col}`} className={`gantt-cell gantt-cell--project ${col === todayStr ? 'today' : ''} ${isPastWeek(col) ? 'past' : ''}`} style={{ background: `${projectColor}08` }} />
                )
              }),
              ...group.tasks.flatMap(t => {
                const taskProj = projectsMap?.get(t.projectId) ?? projects.find(p => p.id === t.projectId)
                const handleOpen = () => onEditTask?.(t)
                const taskStart = t.startDate || t.due || todayStr
                const taskEnd = t.due || todayStr
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
                  ...columns.map((col) => {
                    let isInRange, isStart, isEnd
                    if (isQuarter) {
                      const weekEnd = getWeekEnd(col)
                      isInRange = weekEnd >= taskStart && col <= taskEnd
                      isStart = taskStart >= col && taskStart <= weekEnd
                      isEnd = taskEnd >= col && taskEnd <= weekEnd
                    } else {
                      isInRange = col >= taskStart && col <= taskEnd
                      isStart = col === taskStart
                      isEnd = col === taskEnd
                    }
                    const cellToday = isQuarter ? (todayStr >= col && todayStr <= getWeekEnd(col)) : col === todayStr
                    const cellPast = isQuarter ? getWeekEnd(col) < todayStr : isPastWeek(col)
                    return (
                      <div
                        key={`${t.id}-${col}`}
                        className={`gantt-cell ${cellToday ? 'today' : ''} ${cellPast ? 'past' : ''}`}
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
                          if (tooltipRef.current) {
                            tooltipRef.current.style.left = `${e.clientX}px`
                            tooltipRef.current.style.top = `${e.clientY}px`
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
      </div>
      {tooltip && (
        <div ref={tooltipRef} className="gantt-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <GanttTooltip
            title={tooltip.title}
            startDate={tooltip.startDate}
            endDate={tooltip.endDate}
            status={tooltip.status}
          />
        </div>
      )}
    </div>
  )
}
