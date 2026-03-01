import { useState, useEffect, useCallback, useMemo } from 'react'
import { PRIORITY, SORT_OPTIONS, priorityOrder, DEFAULT_PROJECTS, DEFAULT_TASKS } from './constants'
import { load, save, today, isToday, isOverdue } from './utils'
import MorningModal from './MorningModal'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'
import ProjectForm from './ProjectForm'
import TemplateForm from './TemplateForm'
import ProjectDetail from './ProjectDetail'
import Toast from './Toast'

const DUE_TODAY_CHECK_DELAY_MS = 2000
const TOAST_DURATION_MS = 4000
const SIDEBAR_MENU_ITEMS = [
  { key: 'projects', icon: '📁', label: 'プロジェクト' },
  { key: 'all', icon: '📋', label: 'すべてのタスク' },
  { key: 'today', icon: '☀️', label: '今日', badgeKey: 'todayCount' },
  { key: 'overdue', icon: '🚨', label: '期限超過', badgeKey: 'overdueCount' },
]

export default function App() {
  const [tasks, setTasks] = useState(() => load('tf_tasks', DEFAULT_TASKS))
  const [projects, setProjects] = useState(() => load('tf_projects', DEFAULT_PROJECTS))
  const [templates, setTemplates] = useState(() => load('tf_templates', []))
  const [view, setView] = useState('projects')
  const [sort, setSort] = useState('priority')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [taskFormProjectId, setTaskFormProjectId] = useState(null)
  const [showProjForm, setShowProjForm] = useState(false)
  const [showTplForm, setShowTplForm] = useState(false)
  const [toasts, setToasts] = useState([])
  const [showDone, setShowDone] = useState(false)
  const [notifGranted, setNotifGranted] = useState(false)
  const [showMorning, setShowMorning] = useState(() => localStorage.getItem('tf_morning') !== today())

  useEffect(() => { save('tf_tasks', tasks) }, [tasks])
  useEffect(() => { save('tf_projects', projects) }, [projects])
  useEffect(() => { save('tf_templates', templates) }, [templates])

  useEffect(() => {
    if (typeof globalThis.window !== 'undefined' && 'Notification' in globalThis && globalThis.Notification.permission === 'granted') {
      setNotifGranted(true)
    }
  }, [])

  const addToast = useCallback((icon, title, msg) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, icon, title, msg }])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), TOAST_DURATION_MS)
  }, [])

  useEffect(() => {
    const checkDueToday = () => {
      const dueToday = tasks.filter(t => !t.done && isToday(t.due))
      if (dueToday.length > 0) {
        addToast('⚠️', `今日が期限: ${dueToday.length}件`, dueToday.map(t => t.title).join('、'))
        if (notifGranted) {
          new globalThis.Notification('TaskFlow — 今日の期限', { body: dueToday.map(t => t.title).join('\n') })
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 400])
        }
      }
    }
    const timer = setTimeout(checkDueToday, DUE_TODAY_CHECK_DELAY_MS)
    return () => clearTimeout(timer)
  }, [tasks, notifGranted, addToast])

  const requestNotif = useCallback(async () => {
    if (typeof globalThis.Notification === 'undefined') return
    const permission = await globalThis.Notification.requestPermission()
    if (permission === 'granted') {
      setNotifGranted(true)
      addToast('🔔', '通知が有効になりました', '期限が近いタスクをお知らせします')
    }
  }, [addToast])

  const closeTaskForm = useCallback(() => {
    setShowTaskForm(false)
    setEditTask(null)
    setTaskFormProjectId(null)
  }, [])

  const saveTask = useCallback((form) => {
    if (editTask?.id) {
      setTasks(ts => ts.map(t => (t.id === editTask.id ? { ...t, ...form } : t)))
      addToast('✏️', 'タスクを更新しました', form.title)
    } else {
      const newTask = { ...form, id: 't' + Date.now(), done: false, created: Date.now() }
      setTasks(ts => [newTask, ...ts])
      addToast('✅', 'タスクを追加しました', form.title)
    }
    closeTaskForm()
  }, [editTask?.id, addToast, closeTaskForm])

  const toggleTask = useCallback((id) => {
    const task = tasks.find(t => t.id === id)
    const willComplete = task && !task.done
    setTasks(ts => ts.map(t => (t.id !== id ? t : { ...t, done: !t.done })))
    if (willComplete) addToast('🎉', '完了！', task.title)
  }, [tasks, addToast])

  const saveProject = (form) => {
    setProjects(ps => [...ps, { ...form, id: 'p' + Date.now() }])
    setShowProjForm(false)
    addToast('📁', 'プロジェクト作成', form.name)
  }

  const saveTemplate = (form) => {
    setTemplates(ts => [...ts, { ...form, id: 'tpl' + Date.now() }])
    setShowTplForm(false)
    addToast('📋', 'テンプレート保存', form.title)
  }

  // ── Filtered & sorted tasks ──────────────────────────────
  const filteredTasks = tasks.filter(t => {
    if (!showDone && t.done) return false
    if (view === 'all')     return true
    if (view === 'today')   return isToday(t.due) || isOverdue(t.due)
    if (view === 'overdue') return isOverdue(t.due) && !t.done
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority]
    if (sort === 'due')      return (a.due||'9999') < (b.due||'9999') ? -1 : 1
    if (sort === 'created')  return b.created - a.created
    if (sort === 'name')     return a.title.localeCompare(b.title)
    return 0
  })

  const todayCount   = tasks.filter(t => !t.done && (isToday(t.due) || isOverdue(t.due))).length
  const overdueCount = tasks.filter(t => !t.done && isOverdue(t.due)).length

  const viewTitle = useCallback(() => {
    if (view === 'all') return 'すべてのタスク'
    if (view === 'today') return '今日のタスク'
    if (view === 'overdue') return '期限超過'
    if (view === 'projects') return 'プロジェクト'
    if (view === 'templates') return 'テンプレート'
    if (view.startsWith('p:')) return projects.find(p => p.id === view.slice(2))?.name ?? ''
    return ''
  }, [view, projects])

  const openTaskFormForProject = useCallback((projectId) => {
    setTaskFormProjectId(projectId)
    setShowTaskForm(true)
  }, [])

  const { activeProjects, completedProjects } = useMemo(() => {
    const withStats = (projects || []).map(p => {
      const ptasks = (tasks || []).filter(t => t.projectId === p.id).slice().sort(
        (a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
      )
      const done = ptasks.filter(t => t.done).length
      const pct = ptasks.length ? Math.round((done / ptasks.length) * 100) : 0
      return { project: p, ptasks, pct }
    })
    return {
      activeProjects: withStats.filter(({ ptasks, pct }) => ptasks.length === 0 || pct < 100),
      completedProjects: withStats.filter(({ ptasks, pct }) => ptasks.length > 0 && pct === 100),
    }
  }, [projects, tasks])

  const renderProjectCard = useCallback(({ project: p, ptasks, pct }) => (
    <div key={p.id} className="project-card">
      <button type="button" className="project-card-header project-card-clickable" onClick={() => setView(`p:${p.id}`)}>
        <div className="project-icon" style={{ background: `${p.color}20` }}>{p.icon}</div>
        <div>
          <div className="project-name">{p.name}</div>
          <div className="project-count">{ptasks.filter(t => !t.done).length} 件残り</div>
        </div>
      </button>
      <div className="project-progress" onClick={() => setView(`p:${p.id}`)}>
        <div className="project-progress-fill" style={{ width: `${pct}%`, background: p.color }} />
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{pct}% 完了</div>
      <ul className="project-card-tasks" aria-label={`${p.name}のタスク`}>
        {ptasks.map(t => (
          <li key={t.id} className="project-task-row">
            <input
              type="checkbox"
              className="project-task-check"
              checked={!!t.done}
              onChange={() => toggleTask(t.id)}
              aria-label={`${t.title}を${t.done ? '未完了に' : '完了に'}`}
            />
            <span className={`project-task-title ${t.done ? 'done' : ''}`}>{t.title}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="btn btn-ghost btn-sm project-card-add-task"
        onClick={e => { e.stopPropagation(); openTaskFormForProject(p.id) }}
      >
        ＋ タスクを追加
      </button>
    </div>
  ), [toggleTask, openTaskFormForProject])

  const isProjectView = view.startsWith('p:')
  const currentProject = isProjectView ? projects.find(p => p.id === view.slice(2)) : null

  const taskFormInitialTask = useMemo(() => {
    if (editTask) return editTask
    const projectId = taskFormProjectId ?? (isProjectView ? view.slice(2) : null)
    return projectId ? { projectId } : null
  }, [editTask, taskFormProjectId, isProjectView, view])

  // ── Render ───────────────────────────────────────────────
  return (
    <>
      {showMorning && (
        <MorningModal tasks={tasks} projects={projects} onClose={() => {
          setShowMorning(false); localStorage.setItem('tf_morning', today())
        }} />
      )}

      <div className="app">
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="logo">Task<span>Flow</span></div>
            <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'4px' }}>{tasks.filter(t => !t.done).length} 件のタスク</div>
          </div>

          {!notifGranted && (
            <div style={{ padding:'12px', margin:'8px 12px', background:'var(--accent-glow)', border:'1px solid var(--accent)', borderRadius:'8px' }}>
              <div style={{ fontSize:'12px', fontWeight:'600', marginBottom:'4px' }}>🔔 通知を有効化</div>
              <button className="btn btn-primary btn-sm" style={{ width:'100%' }} onClick={requestNotif}>許可する</button>
            </div>
          )}

          <div className="sidebar-section" style={{ paddingBottom:'8px' }}>
            <div className="sidebar-label">メニュー</div>
            {SIDEBAR_MENU_ITEMS.map(item => {
              const badge = item.badgeKey === 'todayCount' ? todayCount : item.badgeKey === 'overdueCount' ? overdueCount : 0
              return (
                <button key={item.key} className={`sidebar-item ${view === item.key ? 'active' : ''}`}
                  onClick={() => { setView(item.key); setSidebarOpen(false) }}>
                  <span className="icon">{item.icon}</span>
                  {item.label}
                  {badge > 0 && <span className="badge">{badge}</span>}
                </button>
              )
            })}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingRight:'8px' }}>
              プロジェクト
              <button onClick={() => setShowProjForm(true)} style={{ background:'none', border:'none', color:'var(--accent)', cursor:'pointer', fontSize:'16px', lineHeight:1 }}>+</button>
            </div>
            {projects.map(p => (
              <button key={p.id} className={`sidebar-item ${view===`p:${p.id}`?'active':''}`}
                onClick={() => { setView(`p:${p.id}`); setSidebarOpen(false) }}>
                <span className="project-dot" style={{ background: p.color }} />
                {p.icon} {p.name}
                <span style={{ marginLeft:'auto', fontSize:'11px', color:'var(--text-muted)' }}>{tasks.filter(t => t.projectId===p.id && !t.done).length}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-section" style={{ marginTop:'4px' }}>
            <div className="sidebar-label">その他</div>
            <button className={`sidebar-item ${view==='projects'?'active':''}`} onClick={() => { setView('projects'); setSidebarOpen(false) }}>
              <span className="icon">🗂</span>プロジェクト管理
            </button>
            <button className={`sidebar-item ${view==='templates'?'active':''}`} onClick={() => { setView('templates'); setSidebarOpen(false) }}>
              <span className="icon">📋</span>テンプレート
            </button>
          </div>

          <div style={{ padding:'12px', marginTop:'auto' }}>
            <button className="btn btn-ghost btn-sm" style={{ width:'100%' }} onClick={() => setShowMorning(true)}>☀️ 朝の確認を表示</button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          <div className="topbar">
            {isProjectView && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setView('projects')} aria-label="プロジェクト一覧に戻る">
                ← 戻る
              </button>
            )}
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
            <div className="topbar-title">{viewTitle()}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowDone(!showDone)}>
              {showDone ? '完了を非表示' : '完了を表示'}
            </button>
            {!isProjectView && view !== 'projects' && view !== 'templates' && (
              <button className="btn btn-primary" onClick={() => setShowTaskForm(true)}>+ 追加</button>
            )}
          </div>

          <div className="content">

            {/* PROJECT DETAIL */}
            {isProjectView && currentProject && (
              <ProjectDetail
                project={currentProject}
                tasks={tasks}
                projects={projects}
                onToggle={toggleTask}
                onEditTask={setEditTask}
                onAddTask={() => setShowTaskForm(true)}
                sort={sort}
                setSort={setSort}
                showDone={showDone}
              />
            )}

            {/* PROJECTS OVERVIEW */}
            {view === 'projects' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <button className="btn btn-primary" onClick={() => setShowProjForm(true)}>+ プロジェクト追加</button>
                </div>
                <div className="projects-grid">
                  {activeProjects.map(renderProjectCard)}
                </div>
                {completedProjects.length > 0 && (
                  <div className="projects-completed-section">
                    <h2 className="projects-completed-title">完了したプロジェクト</h2>
                    <div className="projects-grid">
                      {completedProjects.map(renderProjectCard)}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TEMPLATES */}
            {view === 'templates' && (
              <>
                <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'20px' }}>
                  <button className="btn btn-primary" onClick={() => setShowTplForm(true)}>+ テンプレート作成</button>
                </div>
                {templates.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>テンプレートがありません</p>
                    <button className="btn btn-primary" onClick={() => setShowTplForm(true)}>最初のテンプレートを作成</button>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {templates.map(t => (
                      <div key={t.id} className="task-card medium" style={{ cursor:'default' }}>
                        <div className="card-header"><div className="card-title">{t.title}</div></div>
                        {t.desc && <div className="card-desc">{t.desc}</div>}
                        <div className="card-footer">
                          <span className={`priority-badge ${t.priority}`}>{PRIORITY[t.priority].label}</span>
                          <button className="btn btn-ghost btn-sm" style={{ marginLeft:'auto' }} onClick={() => setShowTaskForm(true)}>このテンプレを使う</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ALL / TODAY / OVERDUE TASKS */}
            {(view === 'all' || view === 'today' || view === 'overdue') && (
              <>
                <div className="sort-bar">
                  <span className="sort-label">並び替え:</span>
                  {SORT_OPTIONS.map(s => (
                    <button key={s.key} className={`sort-chip ${sort===s.key?'active':''}`} onClick={() => setSort(s.key)}>{s.label}</button>
                  ))}
                </div>
                {sortedTasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">✨</div>
                    <p>タスクがありません</p>
                    <button className="btn btn-primary" onClick={() => setShowTaskForm(true)}>タスクを追加</button>
                  </div>
                ) : (
                  <div className="cards-grid cards-grid--compact">
                    {sortedTasks.map(t => (
                      <TaskCard key={t.id} task={t} projects={projects} onToggle={toggleTask} onClick={() => setEditTask(t)} />
                    ))}
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {(showTaskForm || editTask) && (
        <TaskForm
          task={taskFormInitialTask}
          projects={projects}
          templates={templates}
          onSave={saveTask}
          onClose={closeTaskForm}
        />
      )}
      {showProjForm && <ProjectForm onSave={saveProject} onClose={() => setShowProjForm(false)} />}
      {showTplForm  && <TemplateForm onSave={saveTemplate} onClose={() => setShowTplForm(false)} />}

      <Toast toasts={toasts} />
    </>
  )
}
