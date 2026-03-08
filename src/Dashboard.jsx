import { useMemo } from 'react'
import { isToday, isOverdue } from './utils'

export default function Dashboard({ tasks, projects }) {
  const stats = useMemo(() => {
    const all = tasks.length
    const done = tasks.filter(t => t.done).length
    const inProgress = tasks.filter(t => t.status === 'in_progress' || t.status === 'review').length
    const overdue = tasks.filter(t => !t.done && isOverdue(t.due)).length
    const todayCount = tasks.filter(t => !t.done && isToday(t.due)).length
    return { all, done, inProgress, overdue, todayCount }
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
              <div key={project.id} className="dashboard-proj">
                <div className="dashboard-proj__head">
                  <span className="dashboard-proj__name">{project.icon} {project.name}</span>
                  <span className="dashboard-proj__pct">{pct}%</span>
                </div>
                <div className="dashboard-proj__bar">
                  <div
                    className="dashboard-proj__fill"
                    style={{ width: `${pct}%`, background: project.color }}
                  />
                </div>
                <div className="dashboard-proj__meta">{done} / {total} 完了</div>
              </div>
            ))
          )}
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
                <span className={`dashboard-activity__dot ${t.done ? 'done' : ''}`} />
                <span className="dashboard-activity__title">{t.title}</span>
                <span className="dashboard-activity__meta">
                  {t.done ? '完了' : '追加'} · {t.created ? new Date(t.created).toLocaleDateString('ja-JP') : ''}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  )
}
