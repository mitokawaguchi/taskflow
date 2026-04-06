import { useMemo } from 'react'
import { isToday, isOverdue } from './utils'

function DonutChart({ percentage, color, size = 80 }) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <svg width={size} height={size} className="donut-chart">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="donut-chart__text"
      >
        {percentage}%
      </text>
    </svg>
  )
}

export default function Dashboard({ tasks, projects, setView = () => {} }) {
  const stats = useMemo(() => {
    const all = tasks.length
    const done = tasks.filter(t => t.done).length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const review = tasks.filter(t => t.status === 'review').length
    const todo = tasks.filter(t => t.status === 'todo' || (!t.status && !t.done)).length
    const overdue = tasks.filter(t => !t.done && isOverdue(t.due)).length
    const todayCount = tasks.filter(t => !t.done && isToday(t.due)).length

    const statusBreakdown = [
      { key: 'todo', label: '未着手', count: todo, color: 'var(--text-muted)' },
      { key: 'in_progress', label: '進行中', count: inProgress, color: 'var(--accent)' },
      { key: 'review', label: 'レビュー中', count: review, color: '#ff8c42' },
      { key: 'done', label: '完了', count: done, color: '#06d6a0' },
    ]

    return { all, done, inProgress: inProgress + review, overdue, todayCount, statusBreakdown }
  }, [tasks])

  const projectProgress = useMemo(() => {
    return projects.map(p => {
      const ptasks = tasks.filter(t => t.projectId === p.id)
      const done = ptasks.filter(t => t.done).length
      const pct = ptasks.length ? Math.round((done / ptasks.length) * 100) : 0
      return { project: p, total: ptasks.length, done, pct }
    })
  }, [tasks, projects])

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => (b.created || 0) - (a.created || 0))
      .slice(0, 10)
  }, [tasks])
  const projectIds = useMemo(() => new Set(projects.map((project) => project.id)), [projects])

  const openProject = (projectId) => {
    if (!projectId || !projectIds.has(projectId)) return
    setView(`p:${projectId}`)
  }

  return (
    <div className="dashboard">
      <div className="dashboard-summary">
        <div className="dashboard-card">
          <div className="dashboard-card__icon">📋</div>
          <div className="dashboard-card__val">{stats.all}</div>
          <div className="dashboard-card__label">全タスク</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card__icon">🔄</div>
          <div className="dashboard-card__val">{stats.inProgress}</div>
          <div className="dashboard-card__label">進行中</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card__icon">✅</div>
          <div className="dashboard-card__val">{stats.done}</div>
          <div className="dashboard-card__label">完了</div>
        </div>
        <div className="dashboard-card dashboard-card--critical">
          <div className="dashboard-card__icon">🚨</div>
          <div className="dashboard-card__val">{stats.overdue}</div>
          <div className="dashboard-card__label">期限超過</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section__title">プロジェクト別進捗</h2>
        <div className="dashboard-projects">
          {projects.length === 0 ? (
            <p className="dashboard-empty">プロジェクトがありません</p>
          ) : (
            projectProgress.map(({ project, total, done, pct }) => (
              <button
                key={project.id}
                type="button"
                className="dashboard-proj dashboard-proj--with-chart dashboard-proj--button"
                onClick={() => openProject(project.id)}
                aria-label={`${project.name}の詳細を開く`}
              >
                <DonutChart percentage={pct} color={project.color} size={64} />
                <div className="dashboard-proj__info">
                  <div className="dashboard-proj__name">{project.icon} {project.name}</div>
                  <div className="dashboard-proj__meta">{done} / {total} 完了</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section__title">タスク状態の分布</h2>
        <div className="dashboard-status-chart">
          {stats.statusBreakdown.map(item => (
            <div key={item.key} className="dashboard-status-row">
              <span className="dashboard-status-label">{item.label}</span>
              <div className="dashboard-status-bar-wrap">
                <div
                  className="dashboard-status-bar"
                  style={{
                    width: stats.all > 0 ? `${(item.count / stats.all) * 100}%` : '0%',
                    background: item.color,
                  }}
                />
              </div>
              <span className="dashboard-status-count">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="dashboard-section__title">最近のタスク</h2>
        <ul className="dashboard-activity">
          {recentTasks.length === 0 ? (
            <li className="dashboard-empty">まだタスクがありません</li>
          ) : (
            recentTasks.map(t => (
              <li key={t.id} className="dashboard-activity__item">
                <button
                  type="button"
                  className="dashboard-activity__button"
                  onClick={() => openProject(t.projectId)}
                  disabled={!t.projectId || !projectIds.has(t.projectId)}
                  aria-label={`${t.title}のプロジェクトを開く`}
                >
                  <span className={`dashboard-activity__dot ${t.done ? 'done' : ''}`} />
                  <span className="dashboard-activity__title">{t.title}</span>
                  <span className="dashboard-activity__meta">
                    {t.done ? '完了' : '追加'} · {t.created ? new Date(t.created).toLocaleDateString('ja-JP') : ''}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
