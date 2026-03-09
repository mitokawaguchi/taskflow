import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PRIORITY, SORT_OPTIONS, priorityOrder, PRIORITY_KEYS } from './constants'
import { today, isToday, isOverdue, formatTodayDisplay, endDateLabel } from './utils'

const PRIORITY_OPTIONS = Object.entries(PRIORITY).map(([key, { label }]) => ({ key, label }))
import { fetchProjects, fetchTasks, fetchTemplates, fetchRemember, fetchClients, fetchCategories, fetchUsers, insertProject, updateProject, insertTask, updateTask, insertTemplate, insertRemember, updateRemember, deleteRemember, insertClient, insertCategory, insertUser, getAuthSession, signInWithPassword, signUpWithEmail, signOut, subscribeAuth } from './api'
import MorningModal from './MorningModal'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'
import ProjectForm from './ProjectForm'
import TemplateForm from './TemplateForm'
import ProjectDetail from './ProjectDetail'
import ClientForm from './ClientForm'
import ClientDetail from './ClientDetail'
import Toast from './Toast'
import KanbanBoard from './KanbanBoard'
import Dashboard from './Dashboard'
import GanttChart from './GanttChart'

const DUE_TODAY_CHECK_DELAY_MS = 2000
const DUE_TODAY_NOTIFY_THROTTLE_MS = 60 * 60 * 1000 // 1時間に1回まで
const DUE_TODAY_NOTIFY_STORAGE_KEY = 'taskflow_due_today_notified_at'
const TOAST_DURATION_MS = 4000
const SIDEBAR_MENU_ITEMS = [
  { key: 'projects', icon: '📁', label: 'プロジェクト' },
  { key: 'all', icon: '📋', label: 'すべてのタスク' },
  { key: 'today', icon: '☀️', label: '今日', badgeKey: 'todayCount' },
  { key: 'overdue', icon: '🚨', label: '期限超過', badgeKey: 'overdueCount' },
  { key: 'kanban', icon: '📌', label: 'カンバン' },
  { key: 'dashboard', icon: '📊', label: 'ダッシュボード' },
  { key: 'gantt', icon: '📅', label: 'ガント' },
]

function SortableProjectCard({ item, setView, toggleTask, openTaskFormForProject }) {
  const { project: p, ptasks, pct } = item
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: p.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    background: `${p.color}28`,
    border: `1px solid ${p.color}60`,
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} className={`project-card ${isDragging ? 'project-card-dragging' : ''}`}>
      <div className="project-card-header">
        <span
          className="project-card-drag-handle"
          {...attributes}
          {...listeners}
          aria-label="並び順を変える"
          title="ドラッグで並び替え"
        >
          ⋮⋮
        </span>
        <button
          type="button"
          className="project-card-clickable"
          onClick={() => setView(`p:${p.id}`)}
          style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', border: 'none', background: 'none', padding: 0, font: 'inherit', color: 'inherit', cursor: 'pointer', textAlign: 'left', minWidth: 0 }}
        >
          <div className="project-icon" style={{ background: `${p.color}20` }}>{p.icon}</div>
        <div>
          <div className="project-name">{p.name}</div>
          <div className="project-count">
            {ptasks.filter((t) => !t.done).length} 件残り
            {p.endDate && <span className="project-due"> · {endDateLabel(p.endDate)}</span>}
          </div>
        </div>
        </button>
      </div>
      <div className="project-progress" onClick={() => setView(`p:${p.id}`)}>
        <div className="project-progress-fill" style={{ width: `${pct}%`, background: p.color }} />
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{pct}% 完了</div>
      <ul className="project-card-tasks" aria-label={`${p.name}のタスク`}>
        {ptasks.map((t) => (
          <li key={t.id} className={`project-task-row project-task-row--${t.priority}`}>
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
        onClick={(e) => {
          e.stopPropagation()
          openTaskFormForProject(p.id)
        }}
      >
        ＋ タスクを追加
      </button>
    </div>
  )
}

const CATEGORY_COLOR_OPTIONS = [
  { value: '#3b82f6', label: '青' },
  { value: '#8b5cf6', label: '紫' },
  { value: '#ef4444', label: '赤' },
  { value: '#06b6d4', label: 'シアン' },
  { value: '#6b7280', label: 'グレー' },
  { value: '#ec4899', label: 'ピンク' },
  { value: '#14b8a6', label: 'ティール' },
  { value: '#f59e0b', label: 'オレンジ' },
]

function ProfileLoginForm({ onSuccess, onError, showCloseButton = true }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [signUpMessage, setSignUpMessage] = useState('')

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError(isSignUp ? 'メールとパスワードを入力してください（6文字以上推奨）' : 'メールとパスワードを入力してください')
      return
    }
    if (isSignUp && password.length < 6) {
      setError('パスワードは6文字以上にしてください')
      return
    }
    setError('')
    setSignUpMessage('')
    setLoading(true)
    try {
      if (isSignUp) {
        const data = await signUpWithEmail(email.trim(), password)
        if (data?.session) {
          onSuccess()
        } else {
          setSignUpMessage('確認メールを送りました。メール内のリンクから認証してください。')
          onError?.('✅', 'アカウント作成', '確認メールを送りました')
        }
      } else {
        await signInWithPassword(email.trim(), password)
        onSuccess()
      }
    } catch (e) {
      const msg = e?.message ?? (isSignUp ? 'アカウント作成に失敗しました' : 'ログインに失敗しました')
      setError(msg)
      onError?.('❌', isSignUp ? 'アカウント作成' : 'ログイン', msg)
    } finally {
      setLoading(false)
    }
  }, [email, password, isSignUp, onSuccess, onError])

  return (
    <form onSubmit={handleSubmit} className="form-group">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          className={`btn btn-ghost btn-sm ${!isSignUp ? 'active' : ''}`}
          onClick={() => { setIsSignUp(false); setError(''); setSignUpMessage('') }}
          aria-pressed={!isSignUp}
        >
          ログイン
        </button>
        <button
          type="button"
          className={`btn btn-ghost btn-sm ${isSignUp ? 'active' : ''}`}
          onClick={() => { setIsSignUp(true); setError(''); setSignUpMessage('') }}
          aria-pressed={isSignUp}
        >
          アカウント作成
        </button>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        {isSignUp
          ? 'メールとパスワードで新規アカウントを作成します（Supabase Auth）。'
          : 'Supabase Auth でサインインします。'}
      </p>
      <div className="form-group">
        <label className="form-label" htmlFor="profile-login-email">メール</label>
        <input
          id="profile-login-email"
          type="email"
          className="form-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="email@example.com"
          autoComplete={isSignUp ? 'email' : 'email'}
          disabled={loading}
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="profile-login-password">パスワード</label>
        <input
          id="profile-login-password"
          type="password"
          className="form-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={isSignUp ? '6文字以上' : undefined}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          disabled={loading}
        />
      </div>
      {error && <p style={{ fontSize: 13, color: 'var(--critical)', marginBottom: 12 }}>{error}</p>}
      {signUpMessage && <p style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 12 }}>{signUpMessage}</p>}
      <div className="modal-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (isSignUp ? '作成中…' : 'ログイン中…') : (isSignUp ? 'アカウントを作成' : 'ログイン')}
        </button>
        {showCloseButton && (
          <button type="button" className="btn btn-ghost" onClick={() => onSuccess()} aria-label="閉じる">
            閉じる（ログインしない）
          </button>
        )}
      </div>
    </form>
  )
}

/** 未ログイン時のみ表示するフル画面のログイン画面。タスク等は一切表示しない */
function LoginScreen({ onError }) {
  return (
    <div className="app login-screen">
      <div className="login-screen__inner">
        <div className="login-screen__brand">
          <img
            src="/logo.png"
            alt=""
            className="logo-icon"
            onError={(e) => { e.target.onerror = null; e.target.src = '/logo.svg' }}
          />
          <h1 className="login-screen__title">Task<span>Flow</span></h1>
          <p className="login-screen__lead">ログインしてタスクを管理</p>
        </div>
        <div className="login-screen__form">
          <ProfileLoginForm onSuccess={() => {}} onError={onError} showCloseButton={false} />
        </div>
      </div>
    </div>
  )
}

function SettingsModal({ theme, setTheme, onClose, categories, setCategories, users, setUsers, notifyReminderEnabled, setNotifyReminderEnabled, addToast }) {
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#6b7280')
  const [adding, setAdding] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [addingUser, setAddingUser] = useState(false)

  const handleAddCategory = useCallback(async () => {
    const name = newCatName.trim()
    if (!name) return
    setAdding(true)
    try {
      await insertCategory({
        id: `cat${Date.now()}`,
        name,
        color: newCatColor,
      })
      const list = await fetchCategories()
      setCategories(list)
      setNewCatName('')
      setNewCatColor('#6b7280')
      addToast('✅', 'カテゴリを追加しました', name)
    } catch (e) {
      addToast('❌', '追加できませんでした', e?.message ?? 'Supabase の設定または tf_categories テーブルを確認してください')
    } finally {
      setAdding(false)
    }
  }, [newCatName, newCatColor, setCategories, addToast])

  const handleAddUser = useCallback(async () => {
    const name = newUserName.trim()
    if (!name) return
    setAddingUser(true)
    try {
      await insertUser({
        id: `u${Date.now()}`,
        name,
        email: newUserEmail.trim() || null,
        avatarUrl: '',
        created: Date.now(),
      })
      const list = await fetchUsers()
      setUsers(list)
      setNewUserName('')
      setNewUserEmail('')
      addToast('✅', 'メンバーを追加しました', name)
    } catch (e) {
      addToast('❌', '追加できませんでした', e?.message ?? 'tf_users テーブルを確認してください')
    } finally {
      setAddingUser(false)
    }
  }, [newUserName, newUserEmail, setUsers, addToast])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">設定</h2>
        <div className="form-group">
          <span className="form-label">表示モード</span>
          <div className="theme-toggle" style={{ marginTop: 8 }}>
            <span className="theme-toggle__label">{theme === 'dark' ? 'ダーク' : 'ライト'}</span>
            <button
              type="button"
              className="theme-toggle__switch"
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 24 }}>
          <span className="form-label">カテゴリ</span>
          <p className="form-hint">タスクに付けるカテゴリを追加できます。</p>
          <ul className="settings-category-list" aria-label="登録済みカテゴリ">
            {categories.length === 0 ? (
              <li className="settings-category-empty">Supabase でカテゴリを読み込んでいません（初期データを使用中）</li>
            ) : (
              categories.map(c => (
                <li key={c.id} className="settings-category-item">
                  <span
                    className="settings-category-dot"
                    style={{ background: c.color }}
                    aria-hidden
                  />
                  <span>{c.name}</span>
                </li>
              ))
            )}
          </ul>
          <div className="settings-category-add">
            <input
              type="text"
              className="form-input"
              placeholder="新しいカテゴリ名"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
              aria-label="新しいカテゴリ名"
            />
            <select
              className="form-select"
              value={newCatColor}
              onChange={e => setNewCatColor(e.target.value)}
              aria-label="色"
            >
              {CATEGORY_COLOR_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddCategory}
              disabled={adding || !newCatName.trim()}
            >
              {adding ? '追加中…' : '追加'}
            </button>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 24 }}>
          <span className="form-label">チームメンバー</span>
          <p className="form-hint">タスクの担当者として選べるメンバーを追加します。</p>
          <ul className="settings-category-list" aria-label="チームメンバー">
            {users.length === 0 ? (
              <li className="settings-category-empty">メンバーがいません。追加するとタスクに担当者を割り当てられます。</li>
            ) : (
              users.map(u => (
                <li key={u.id} className="settings-category-item">
                  <span className="settings-user-avatar">
                    {u.avatarUrl ? <img src={u.avatarUrl} alt="" width={24} height={24} style={{ borderRadius: '50%' }} /> : '👤'}
                  </span>
                  <span>{u.name}{u.email ? ` (${u.email})` : ''}</span>
                </li>
              ))
            )}
          </ul>
          <div className="settings-category-add">
            <input
              type="text"
              className="form-input"
              placeholder="表示名"
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddUser()}
              aria-label="メンバー名"
            />
            <input
              type="email"
              className="form-input"
              placeholder="メール（任意）"
              value={newUserEmail}
              onChange={e => setNewUserEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddUser()}
              aria-label="メール"
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddUser}
              disabled={addingUser || !newUserName.trim()}
            >
              {addingUser ? '追加中…' : '追加'}
            </button>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: 24 }}>
          <span className="form-label">通知</span>
          <div className="theme-toggle" style={{ marginTop: 8 }}>
            <span className="theme-toggle__label">期限リマインダー（今日が期限のタスクをお知らせ）</span>
            <button
              type="button"
              className="theme-toggle__switch"
              aria-pressed={notifyReminderEnabled}
              onClick={() => setNotifyReminderEnabled(v => !v)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>閉じる</button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [templates, setTemplates] = useState([])
  const [clients, setClients] = useState([])
  const [remembers, setRemembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showClientForm, setShowClientForm] = useState(false)
  const [view, setView] = useState('projects')
  const [sort, setSort] = useState('priority')
  const [filterProjectIds, setFilterProjectIds] = useState([])
  const [filterPriorities, setFilterPriorities] = useState([])
  const [filterDueFrom, setFilterDueFrom] = useState('')
  const [filterDueTo, setFilterDueTo] = useState('')
  const [filterPriorityFrom, setFilterPriorityFrom] = useState('')
  const [filterPriorityTo, setFilterPriorityTo] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [sidebarProjectsOpen, setSidebarProjectsOpen] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [taskFormProjectId, setTaskFormProjectId] = useState(null)
  const [showProjForm, setShowProjForm] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [showTplForm, setShowTplForm] = useState(false)
  const [toasts, setToasts] = useState([])
  const [showDone, setShowDone] = useState(false)
  const [notifGranted, setNotifGranted] = useState(false)
  const [showMorning, setShowMorning] = useState(() => localStorage.getItem('tf_morning') !== today())
  const [theme, setTheme] = useState(() => localStorage.getItem('taskflow_theme') || 'light')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])
  const [filterAssigneeId, setFilterAssigneeId] = useState('')
  const [authUser, setAuthUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [notifyReminderEnabled, setNotifyReminderEnabled] = useState(() => localStorage.getItem('taskflow_notify_reminder') !== 'false')
  const [showProfileModal, setShowProfileModal] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('taskflow_theme', theme)
  }, [theme])

  const addToast = useCallback((icon, title, msg) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, icon, title, msg }])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), TOAST_DURATION_MS)
  }, [])

  useEffect(() => {
    if (!authUser) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    async function load() {
      try {
        const [projs, ts, tpls, clis, rems] = await Promise.all([fetchProjects(), fetchTasks(), fetchTemplates(), fetchClients(), fetchRemember()])
        let cats = []
        let usrs = []
        try {
          cats = await fetchCategories()
        } catch {
          // tf_categories 未作成時はフォールバック用に空のまま
        }
        try {
          usrs = await fetchUsers()
        } catch {
          // tf_users 未作成時は空のまま
        }
        if (!cancelled) {
          setProjects(projs)
          setTasks(ts)
          setTemplates(tpls)
          setClients(clis)
          setRemembers(rems)
          setCategories(cats)
          setUsers(usrs)
        }
      } catch (e) {
        if (!cancelled) addToast('❌', '読み込みエラー', e?.message ?? 'データを取得できませんでした')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [authUser, addToast])

  useEffect(() => {
    if (typeof globalThis.window !== 'undefined' && 'Notification' in globalThis && globalThis.Notification.permission === 'granted') {
      setNotifGranted(true)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    getAuthSession().then(session => {
      if (!cancelled) {
        setAuthUser(session?.user ?? null)
        setAuthReady(true)
      }
    })
    const unsub = subscribeAuth(session => setAuthUser(session?.user ?? null))
    return () => { cancelled = true; unsub() }
  }, [])

  useEffect(() => {
    localStorage.setItem('taskflow_notify_reminder', notifyReminderEnabled ? 'true' : 'false')
  }, [notifyReminderEnabled])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  useEffect(() => {
    const checkDueToday = () => {
      const dueToday = tasks.filter(t => !t.done && isToday(t.due))
      if (dueToday.length === 0) return
      if (!notifyReminderEnabled) return
      const now = Date.now()
      const lastAt = Number.parseInt(localStorage.getItem(DUE_TODAY_NOTIFY_STORAGE_KEY) ?? '0', 10)
      if (now - lastAt < DUE_TODAY_NOTIFY_THROTTLE_MS) return
      localStorage.setItem(DUE_TODAY_NOTIFY_STORAGE_KEY, String(now))
      addToast('⚠️', `今日が期限: ${dueToday.length}件`, dueToday.map(t => t.title).join('、'))
      if (notifGranted) {
        new globalThis.Notification('TaskFlow — 今日の期限', { body: dueToday.map(t => t.title).join('\n') })
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 400])
      }
    }
    const timer = setTimeout(checkDueToday, DUE_TODAY_CHECK_DELAY_MS)
    return () => clearTimeout(timer)
  }, [tasks, notifGranted, addToast, notifyReminderEnabled])

  const requestNotif = useCallback(async () => {
    if (typeof globalThis.Notification === 'undefined') return
    const permission = await globalThis.Notification.requestPermission()
    if (permission === 'granted') {
      setNotifGranted(true)
      addToast('🔔', '通知が有効になりました', '期限が近いタスクをお知らせします')
    }
  }, [addToast])

  const [kanbanAddStatus, setKanbanAddStatus] = useState(null)

  const closeTaskForm = useCallback(() => {
    setShowTaskForm(false)
    setEditTask(null)
    setTaskFormProjectId(null)
    setKanbanAddStatus(null)
  }, [])

  const saveTask = useCallback(async (form) => {
    try {
      if (editTask?.id) {
        const updated = await updateTask(editTask.id, form)
        setTasks(ts => ts.map(t => (t.id === updated.id ? updated : t)))
        addToast('✏️', 'タスクを更新しました', form.title)
      } else {
        const status = form.status || 'todo'
        const newTask = { ...form, id: 't' + Date.now(), done: status === 'done', status, created: Date.now() }
        const created = await insertTask(newTask)
        setTasks(ts => [created, ...ts])
        addToast('✅', 'タスクを追加しました', form.title)
      }
      closeTaskForm()
    } catch (e) {
      addToast('❌', '保存できませんでした', e?.message ?? '')
    }
  }, [editTask?.id, addToast, closeTaskForm])

  const toggleTask = useCallback(async (id) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    const willComplete = !task.done
    try {
      const updated = await updateTask(id, { done: willComplete, status: willComplete ? 'done' : 'todo' })
      setTasks(ts => ts.map(t => (t.id === id ? updated : t)))
      if (willComplete) addToast('🎉', '完了！', task.title)
    } catch (e) {
      addToast('❌', '更新できませんでした', e?.message ?? '')
    }
  }, [tasks, addToast])

  const moveTaskStatus = useCallback(async (taskId, newStatus) => {
    try {
      const updated = await updateTask(taskId, { status: newStatus, done: newStatus === 'done' })
      setTasks(ts => ts.map(t => (t.id === taskId ? updated : t)))
    } catch (e) {
      addToast('❌', '状態の更新に失敗しました', e?.message ?? '')
    }
  }, [addToast])

  const openTaskFormForKanbanColumn = useCallback((columnStatus) => {
    setKanbanAddStatus(columnStatus)
    setEditTask(null)
    setTaskFormProjectId(null)
    setShowTaskForm(true)
  }, [])

  const saveProject = useCallback(async (form) => {
    try {
      if (editProject) {
        const updated = await updateProject(editProject.id, {
          name: form.name,
          icon: form.icon,
          color: form.color,
          endDate: form.endDate ?? '',
        })
        setProjects(ps => ps.map(p => (p.id === updated.id ? updated : p)))
        setShowProjForm(false)
        setEditProject(null)
        addToast('✏️', 'プロジェクトを更新しました', form.name)
      } else {
        const nextOrder = projects.length ? Math.max(...projects.map(p => p.sortOrder ?? 0), -1) + 1 : 0
        const project = { ...form, id: 'p' + Date.now(), endDate: form.endDate ?? '', sortOrder: nextOrder }
        const created = await insertProject(project)
        setProjects(ps => [...ps, created])
        setShowProjForm(false)
        addToast('📁', 'プロジェクト作成', form.name)
      }
    } catch (e) {
      addToast('❌', editProject ? '更新できませんでした' : '作成できませんでした', e?.message ?? '')
    }
  }, [addToast, projects, editProject])

  const updateProjectEndDate = useCallback(async (projectId, endDate) => {
    try {
      const updated = await updateProject(projectId, { endDate: endDate || '' })
      setProjects(ps => ps.map(p => (p.id === projectId ? updated : p)))
      addToast('📅', '終了日を更新しました', '')
    } catch (e) {
      addToast('❌', '更新できませんでした', e?.message ?? '')
    }
  }, [addToast])

  const saveTemplate = useCallback(async (form) => {
    try {
      const template = { ...form, id: 'tpl' + Date.now() }
      const created = await insertTemplate(template)
      setTemplates(ts => [...ts, created])
      setShowTplForm(false)
      addToast('📋', 'テンプレート保存', form.title)
    } catch (e) {
      addToast('❌', '保存できませんでした', e?.message ?? '')
    }
  }, [addToast])

  const addRemember = useCallback(async (clientId, body) => {
    if (!body?.trim()) return
    try {
      const item = { id: 'rem' + Date.now(), clientId, body: body.trim(), created: Date.now() }
      const created = await insertRemember(item)
      setRemembers(prev => [created, ...prev])
      addToast('📌', '覚えておくことを追加しました', '')
    } catch (e) {
      addToast('❌', '追加できませんでした', e?.message ?? '')
    }
  }, [addToast])

  const addClient = useCallback(async (form) => {
    try {
      const client = { ...form, id: 'c' + Date.now() }
      const created = await insertClient(client)
      setClients(prev => [...prev, created])
      setShowClientForm(false)
      addToast('🤝', 'クライアントを追加しました', form.name)
    } catch (e) {
      addToast('❌', '追加できませんでした', e?.message ?? '')
    }
  }, [addToast])

  const updateRememberItem = useCallback(async (id, body) => {
    if (!body?.trim()) return
    try {
      const updated = await updateRemember(id, { body: body.trim() })
      setRemembers(prev => prev.map(r => (r.id === id ? updated : r)))
      addToast('✏️', '更新しました', '')
    } catch (e) {
      addToast('❌', '更新できませんでした', e?.message ?? '')
    }
  }, [addToast])

  const removeRemember = useCallback(async (id) => {
    try {
      await deleteRemember(id)
      setRemembers(prev => prev.filter(r => r.id !== id))
      addToast('🗑️', '削除しました', '')
    } catch (e) {
      addToast('❌', '削除できませんでした', e?.message ?? '')
    }
  }, [addToast])

  // ── Filtered & sorted tasks ──────────────────────────────
  const hasAnyFilter = filterProjectIds.length > 0 || filterPriorities.length > 0 ||
    filterDueFrom || filterDueTo || filterPriorityFrom || filterPriorityTo || filterAssigneeId

  const filteredTasks = tasks.filter(t => {
    if (!showDone && t.done) return false
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      const matchTitle = t.title && t.title.toLowerCase().includes(q)
      const matchNotes = t.notes && String(t.notes).toLowerCase().includes(q)
      if (!matchTitle && !matchNotes) return false
    }
    if (view === 'all')     { /* continue */ }
    else if (view === 'today')   { if (!isToday(t.due)) return false }
    else if (view === 'overdue') { if (!isOverdue(t.due) || t.done) return false }
    else return true
    if (view !== 'all' && view !== 'today' && view !== 'overdue') return true
    if (filterProjectIds.length > 0 && !filterProjectIds.includes(t.projectId)) return false
    if (filterPriorities.length > 0 && !filterPriorities.includes(t.priority)) return false
    if (filterAssigneeId && t.assigneeId !== filterAssigneeId) return false
    if (filterDueFrom && (!t.due || t.due < filterDueFrom)) return false
    if (filterDueTo && (!t.due || t.due > filterDueTo)) return false
    if (filterPriorityFrom !== '' || filterPriorityTo !== '') {
      const from = filterPriorityFrom === '' ? 0 : (priorityOrder[filterPriorityFrom] ?? 0)
      const to = filterPriorityTo === '' ? 3 : (priorityOrder[filterPriorityTo] ?? 3)
      const o = priorityOrder[t.priority] ?? 2
      if (o < from || o > to) return false
    }
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sort === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority]
    if (sort === 'due')      return (a.due||'9999') < (b.due||'9999') ? -1 : 1
    if (sort === 'created')  return b.created - a.created
    if (sort === 'name')     return a.title.localeCompare(b.title)
    return 0
  })

  const todayCount   = tasks.filter(t => !t.done && isToday(t.due)).length
  const overdueCount = tasks.filter(t => !t.done && isOverdue(t.due)).length

  const viewTitle = useCallback(() => {
    if (view === 'all') return 'すべてのタスク'
    if (view === 'today') return '今日のタスク'
    if (view === 'overdue') return '期限超過'
    if (view === 'kanban') return 'カンバン'
    if (view === 'dashboard') return 'ダッシュボード'
    if (view === 'gantt') return 'ガントチャート'
    if (view === 'projects') return 'プロジェクト'
    if (view === 'templates') return 'テンプレート'
    if (view === 'clients') return '覚えておくこと'
    if (view.startsWith('c:')) return clients.find(c => c.id === view.slice(2))?.name ?? 'クライアント'
    if (view.startsWith('p:')) return projects.find(p => p.id === view.slice(2))?.name ?? ''
    return ''
  }, [view, projects, clients])

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
    <div
      key={p.id}
      className="project-card"
      style={{ background: `${p.color}28`, border: `1px solid ${p.color}60` }}
    >
      <button type="button" className="project-card-header project-card-clickable" onClick={() => setView(`p:${p.id}`)}>
        <div className="project-icon" style={{ background: `${p.color}20` }}>{p.icon}</div>
        <div>
          <div className="project-name">{p.name}</div>
          <div className="project-count">{ptasks.filter(t => !t.done).length} 件残り{p.endDate && <span className="project-due"> · {endDateLabel(p.endDate)}</span>}</div>
        </div>
      </button>
      <div className="project-progress" onClick={() => setView(`p:${p.id}`)}>
        <div className="project-progress-fill" style={{ width: `${pct}%`, background: p.color }} />
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{pct}% 完了</div>
      <ul className="project-card-tasks" aria-label={`${p.name}のタスク`}>
        {ptasks.map(t => (
          <li key={t.id} className={`project-task-row project-task-row--${t.priority}`}>
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

  const handleProjectDragEnd = useCallback(
    async (event) => {
      const { active, over } = event
      setDragActiveId(null)
      if (!over || active.id === over.id) return
      const oldIndex = activeProjects.findIndex((x) => x.project.id === active.id)
      const newIndex = activeProjects.findIndex((x) => x.project.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return
      const reordered = arrayMove(activeProjects, oldIndex, newIndex)
      const newProjects = [
        ...reordered.map((x) => x.project),
        ...completedProjects.map((x) => x.project),
      ].map((p, i) => ({ ...p, sortOrder: i }))
      setProjects(newProjects)
      try {
        await Promise.all(newProjects.map((p, i) => updateProject(p.id, { sortOrder: i })))
        addToast('📁', '並び順を更新しました', '')
      } catch (e) {
        addToast('❌', '並び順の保存に失敗しました', e?.message ?? '')
      }
    },
    [activeProjects, completedProjects, addToast]
  )

  const [dragActiveId, setDragActiveId] = useState(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const isProjectView = view.startsWith('p:')
  const currentProject = isProjectView ? projects.find(p => p.id === view.slice(2)) : null
  const isMainView = ['kanban', 'gantt', 'dashboard', 'all', 'today', 'overdue', 'projects', 'templates'].includes(view) || isProjectView
  const viewTabs = [
    { key: 'kanban', label: 'カンバン', icon: '📌' },
    { key: 'gantt', label: 'タイムライン', icon: '📅' },
    { key: 'dashboard', label: 'インサイト', icon: '📊' },
  ]
  const activeFilterCount = [filterProjectIds.length, filterPriorities.length, filterDueFrom, filterDueTo, filterPriorityFrom, filterPriorityTo, filterAssigneeId].filter(Boolean).length
  const tasksForBoard = useMemo(() => {
    let list = tasks
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(t => (t.title && t.title.toLowerCase().includes(q)) || (t.notes && String(t.notes).toLowerCase().includes(q)))
    }
    if (currentProject) list = list.filter(t => t.projectId === currentProject.id)
    return list
  }, [tasks, searchQuery, currentProject])

  const taskFormInitialTask = useMemo(() => {
    if (editTask) return editTask
    const projectId = taskFormProjectId ?? (isProjectView ? view.slice(2) : null)
    const status = kanbanAddStatus ?? null
    return (projectId || status) ? { projectId: projectId || null, status } : null
  }, [editTask, taskFormProjectId, isProjectView, view, kanbanAddStatus])

  // ── Render ───────────────────────────────────────────────
  if (!authReady) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>認証確認中...</p>
      </div>
    )
  }

  if (authReady && !authUser) {
    return (
      <>
        <LoginScreen onError={addToast} />
        <Toast toasts={toasts} />
      </>
    )
  }

  if (loading) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>読み込み中...</p>
      </div>
    )
  }

  return (
    <>
      {showMorning && (
        <MorningModal tasks={tasks} projects={projects} onClose={() => {
          setShowMorning(false); localStorage.setItem('tf_morning', today())
        }} />
      )}

      <div className={`app ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true" />}

        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="logo">
              <img
                src="/logo.png"
                alt=""
                className="logo-icon"
                onError={(e) => { e.target.onerror = null; e.target.src = '/logo.svg' }}
              />
              <span className="logo-text">Task<span>Flow</span></span>
            </div>
            <div className="sidebar-today">
              <span className="sidebar-today-label">今日</span>
              <span className="sidebar-today-date">{formatTodayDisplay()}</span>
            </div>
            <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'2px' }}>{tasks.filter(t => !t.done).length} 件のタスク</div>
          </div>

          {!notifGranted && (
            <div style={{ padding:'12px', margin:'8px 12px', background:'var(--accent-glow)', border:'1px solid var(--accent)', borderRadius:'8px' }}>
              <div style={{ fontSize:'12px', fontWeight:'600', marginBottom:'4px' }}>🔔 通知を有効化</div>
              <p style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'8px', lineHeight:1.4 }}>
                アプリを開いたときに「今日が期限」のタスクがあれば通知します。スマホではバックグラウンド通知には未対応です。
              </p>
              <button className="btn btn-primary btn-sm" style={{ width:'100%' }} onClick={requestNotif}>許可する</button>
            </div>
          )}

          <div className="sidebar-section" style={{ paddingBottom:'8px' }}>
            <div className="sidebar-label">メニュー</div>
            {SIDEBAR_MENU_ITEMS.map(item => {
              const badge = item.badgeKey === 'todayCount' ? todayCount : item.badgeKey === 'overdueCount' ? overdueCount : 0
              const allTaskCount = item.key === 'all' ? tasks.filter(t => !t.done).length : null
              return (
                <button key={item.key} className={`sidebar-item ${view === item.key ? 'active' : ''}`}
                  onClick={() => { setView(item.key); setSidebarOpen(false) }}>
                  <span className="icon">{item.icon}</span>
                  {item.label}
                  {item.key === 'all' && (
                    <span className="sidebar-item-count" style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {allTaskCount}
                    </span>
                  )}
                  {badge > 0 && <span className="badge">{badge}</span>}
                </button>
              )
            })}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label sidebar-label--with-toggle" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingRight:'8px' }}>
              <button
                type="button"
                className="sidebar-project-toggle"
                onClick={() => setSidebarProjectsOpen(o => !o)}
                aria-expanded={sidebarProjectsOpen}
              >
                {sidebarProjectsOpen ? 'プロジェクト ▲' : 'プロジェクト ▼'}
              </button>
              <button type="button" className="sidebar-add-proj" onClick={() => { setEditProject(null); setShowProjForm(true) }} aria-label="プロジェクト追加">+</button>
            </div>
            {sidebarProjectsOpen && projects.map(p => (
              <button key={p.id} className={`sidebar-item ${view===`p:${p.id}`?'active':''}`}
                onClick={() => { setView(`p:${p.id}`); setSidebarOpen(false) }}>
                <span className="project-dot" style={{ background: p.color }} />
                <span className="sidebar-item__label">{p.icon} {p.name}</span>
                <span className="sidebar-item__count">{tasks.filter(t => t.projectId===p.id && !t.done).length}</span>
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
            <button className={`sidebar-item ${view==='clients'||view.startsWith('c:')?'active':''}`} onClick={() => { setView('clients'); setSidebarOpen(false) }}>
              <span className="icon">📌</span>覚えておくこと
            </button>
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-label">チーム</div>
            <div className="sidebar-team-avatars" aria-label="チームメンバー">
              {users.length === 0 ? (
                <span className="sidebar-team-placeholder">設定でメンバーを追加</span>
              ) : (
                users.slice(0, 12).map(u => (
                  <button
                    key={u.id}
                    type="button"
                    className={`sidebar-team-avatar ${filterAssigneeId === u.id ? 'active' : ''}`}
                    onClick={() => { setFilterAssigneeId(prev => (prev === u.id ? '' : u.id)); setView('all'); setFilterOpen(true); setSidebarOpen(false) }}
                    title={`${u.name}で絞り込み`}
                    aria-label={`${u.name}で絞り込み`}
                  >
                    {u.avatarUrl ? <img src={u.avatarUrl} alt="" /> : <span>👤</span>}
                  </button>
                ))
              )}
            </div>
            <button type="button" className="sidebar-item" onClick={() => { setShowSettings(true); setSidebarOpen(false) }}>
              <span className="icon">⚙️</span>設定
            </button>
            <button type="button" className="sidebar-item sidebar-item--logout" onClick={() => { setShowProfileModal(true); setSidebarOpen(false) }}>
              <span className="icon">🚪</span>ログアウト
            </button>
          </div>
          <div style={{ padding:'12px', marginTop:'auto' }}>
            <button className="btn btn-ghost btn-sm" style={{ width:'100%' }} onClick={() => setShowMorning(true)}>☀️ 朝の確認を表示</button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="main">
          <div className="topbar">
            {(isProjectView || view.startsWith('c:')) && (
              <button type="button" className="btn btn-ghost btn-sm topbar-back" onClick={() => setView(isProjectView ? 'projects' : 'clients')} aria-label="一覧に戻る">
                ← 戻る
              </button>
            )}
            <button type="button" className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="メニュー">☰</button>
            <div className="topbar-title">{viewTitle()}</div>

            {isMainView && (
              <div className="topbar-tabs" role="tablist" aria-label="ビュー切替">
                {viewTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={view === tab.key}
                    className={`topbar-tab ${view === tab.key ? 'topbar-tab--active' : ''}`}
                    onClick={() => setView(tab.key)}
                  >
                    <span className="topbar-tab__icon">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            <div className="topbar-right">
              <div className="theme-toggle" role="group" aria-label="表示モード">
                <span className="theme-toggle__label">{theme === 'dark' ? 'ダーク' : 'ライト'}</span>
                <button
                  type="button"
                  className="theme-toggle__switch"
                  aria-pressed={theme === 'dark'}
                  aria-label={theme === 'dark' ? 'ダークモード（クリックでライトに）' : 'ライトモード（クリックでダークに）'}
                  onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
                />
              </div>
              {view !== 'clients' && !view.startsWith('c:') && (
                <>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm topbar-filter-btn"
                    onClick={() => {
                      if (!['all', 'today', 'overdue'].includes(view)) setView('all')
                      setFilterOpen(o => !o)
                    }}
                    aria-label="フィルター"
                  >
                    フィルター
                    {activeFilterCount > 0 && <span className="topbar-filter-badge">{activeFilterCount}</span>}
                  </button>
                  <label className="topbar-search-wrap">
                    <span className="topbar-search-icon" aria-hidden>🔍</span>
                    <input
                      type="search"
                      className="topbar-search"
                      placeholder="タスクを検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="タスクを検索"
                    />
                  </label>
                  <button
                    type="button"
                    className="topbar-icon-btn"
                    onClick={() => setShowMorning(true)}
                    aria-label="通知"
                    title="今日のタスク・朝の確認"
                  >
                    🔔
                    {(todayCount > 0 || overdueCount > 0) && <span className="topbar-icon-dot" />}
                  </button>
                  <button
                    type="button"
                    className="topbar-avatar"
                    onClick={() => setShowProfileModal(true)}
                    aria-label="プロフィール・設定"
                    title="プロフィール"
                  >
                    👤
                  </button>
                </>
              )}
              {view !== 'clients' && !view.startsWith('c:') && (
                <button className="btn btn-ghost btn-sm" onClick={() => setShowDone(!showDone)}>
                  {showDone ? '完了を非表示' : '完了を表示'}
                </button>
              )}
              {!isProjectView && view !== 'projects' && view !== 'templates' && view !== 'clients' && !view.startsWith('c:') && (
                <button type="button" className="btn btn-primary" onClick={() => setShowTaskForm(true)}>+ 追加</button>
              )}
            </div>
          </div>

          <div className="content">
            <div key={view} className="content-view">
            {/* PROJECT DETAIL */}
            {isProjectView && currentProject && (
              <ProjectDetail
                project={currentProject}
                tasks={tasks}
                projects={projects}
                categories={categories}
                users={users}
                onToggle={toggleTask}
                onEditTask={setEditTask}
                onAddTask={() => setShowTaskForm(true)}
                onEditProject={() => { setEditProject(currentProject); setShowProjForm(true) }}
                onUpdateProjectEndDate={updateProjectEndDate}
                sort={sort}
                setSort={setSort}
                showDone={showDone}
              />
            )}

            {/* 覚えておくこと（クライアントごと・プロジェクトと別） */}
            {view === 'clients' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <button type="button" className="btn btn-primary" onClick={() => setShowClientForm(true)}>
                    + クライアント追加
                  </button>
                </div>
                {clients.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🤝</div>
                    <p>クライアントがありません</p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      取引先・担当先を追加すると、そのクライアントごとに「今後に向けて覚えておくこと」をメモできます。プロジェクトとは別で残ります。
                    </p>
                    <button type="button" className="btn btn-primary" onClick={() => setShowClientForm(true)}>
                      最初のクライアントを追加
                    </button>
                  </div>
                ) : (
                  <div className="projects-grid clients-grid">
                    {clients.map(c => {
                      const clientRemembers = remembers.filter(r => r.clientId === c.id)
                      return (
                        <div
                          key={c.id}
                          className="task-card"
                          style={{
                            cursor: 'default',
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: '140px',
                            background: `${c.color}28`,
                            borderColor: `${c.color}60`,
                          }}
                        >
                          <div
                            className="remember-client-label"
                            style={{ background: `${c.color}22`, color: c.color, border: `2px solid ${c.color}66` }}
                          >
                            <span className="remember-client-icon">{c.icon}</span>
                            <span className="remember-client-name">{c.name}</span>
                          </div>
                          {clientRemembers.length === 0 ? (
                            <p className="remember-empty">まだありません</p>
                          ) : (
                            <ul className="remember-list">
                              {clientRemembers.map(r => (
                                <li key={r.id} className="remember-item" style={{ borderLeftColor: c.color }}>
                                  <span className="remember-icon" aria-hidden>📌</span>
                                  <span className="remember-body">{r.body}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          <div className="card-footer" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => { setView('c:' + c.id); setSidebarOpen(false) }}
                            >
                              編集・追加
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            {view.startsWith('c:') && (() => {
              const clientId = view.slice(2)
              const client = clients.find(c => c.id === clientId)
              if (!client) return null
              return (
                <>
                  <button type="button" className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }} onClick={() => setView('clients')}>
                    ← クライアント一覧
                  </button>
                  <ClientDetail
                    client={client}
                    remembers={remembers.filter(r => r.clientId === client.id)}
                    onAddRemember={addRemember}
                    onUpdateRemember={updateRememberItem}
                    onDeleteRemember={removeRemember}
                  />
                </>
              )
            })()}

            {/* PROJECTS OVERVIEW */}
            {view === 'projects' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <button className="btn btn-primary" onClick={() => { setEditProject(null); setShowProjForm(true) }}>+ プロジェクト追加</button>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={({ active }) => setDragActiveId(active.id)}
                  onDragEnd={handleProjectDragEnd}
                >
                  <SortableContext
                    items={activeProjects.map((x) => x.project.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="projects-grid">
                      {activeProjects.map((item) => (
                        <SortableProjectCard
                          key={item.project.id}
                          item={item}
                          setView={setView}
                          toggleTask={toggleTask}
                          openTaskFormForProject={openTaskFormForProject}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay dropAnimation={null}>
                    {dragActiveId ? (() => {
                      const item = activeProjects.find((x) => x.project.id === dragActiveId)
                      if (!item) return null
                      const { project: p, ptasks, pct } = item
                      return (
                        <div
                          className="project-card project-card-overlay"
                          style={{ background: `${p.color}28`, border: `1px solid ${p.color}60` }}
                        >
                          <div className="project-card-header" style={{ cursor: 'grabbing' }}>
                            <span className="project-card-drag-handle" aria-hidden>⋮⋮</span>
                            <div className="project-icon" style={{ background: `${p.color}20` }}>{p.icon}</div>
                            <div>
                              <div className="project-name">{p.name}</div>
                              <div className="project-count">
                                {ptasks.filter((t) => !t.done).length} 件残り
                                {p.endDate && <span className="project-due"> · {endDateLabel(p.endDate)}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="project-progress">
                            <div className="project-progress-fill" style={{ width: `${pct}%`, background: p.color }} />
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>{pct}% 完了</div>
                        </div>
                      )
                    })() : null}
                  </DragOverlay>
                </DndContext>
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
            {view === 'kanban' && (
              <KanbanBoard
                tasks={tasksForBoard}
                projects={projects}
                categories={categories}
                onMoveTask={moveTaskStatus}
                onEditTask={(task) => { setEditTask(task); setShowTaskForm(true) }}
                onAddTask={openTaskFormForKanbanColumn}
              />
            )}

            {view === 'dashboard' && (
              <Dashboard tasks={tasksForBoard} projects={projects} />
            )}

            {view === 'gantt' && (
              <GanttChart
                tasks={tasksForBoard}
                projects={projects}
                onEditTask={(task) => { setEditTask(task); setShowTaskForm(true) }}
              />
            )}

            {(view === 'all' || view === 'today' || view === 'overdue') && (
              <>
                <button
                  type="button"
                  className="filter-toggle"
                  onClick={() => setFilterOpen(o => !o)}
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
                        {projects.map(p => {
                          const on = filterProjectIds.includes(p.id)
                          return (
                            <button
                              key={p.id}
                              type="button"
                              className={`sort-chip ${on ? 'active' : ''}`}
                              onClick={() => setFilterProjectIds(prev => on ? prev.filter(id => id !== p.id) : [...prev, p.id])}
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
                        {users.map(u => {
                          const on = filterAssigneeId === u.id
                          return (
                            <button
                              key={u.id}
                              type="button"
                              className={`sort-chip ${on ? 'active' : ''}`}
                              onClick={() => setFilterAssigneeId(prev => (prev === u.id ? '' : u.id))}
                              title={u.name}
                            >
                              {u.avatarUrl ? <img src={u.avatarUrl} alt="" width={16} height={16} style={{ borderRadius: '50%', verticalAlign: 'middle', marginRight: 4 }} /> : '👤'}
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
                        {PRIORITY_OPTIONS.map(opt => {
                          const on = filterPriorities.includes(opt.key)
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              className={`sort-chip ${on ? 'active' : ''}`}
                              onClick={() => setFilterPriorities(prev => on ? prev.filter(k => k !== opt.key) : [...prev, opt.key])}
                            >
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div className="sort-bar">
                      <span className="sort-label">ソート:</span>
                      {SORT_OPTIONS.map(s => (
                        <button key={s.key} className={`sort-chip ${sort===s.key?'active':''}`} onClick={() => setSort(s.key)}>{s.label}</button>
                      ))}
                    </div>
                    {(sort === 'due' || sort === 'priority') && (
                      <div className="filter-bar sort-filter-bar">
                        {sort === 'due' && (
                          <div className="filter-group">
                            <span className="filter-group-label">期限:</span>
                            <label className="filter-range-label">
                              いつから
                              <input type="date" className="form-input filter-date" value={filterDueFrom} onChange={e => setFilterDueFrom(e.target.value)} />
                            </label>
                            <span className="filter-range-sep">〜</span>
                            <label className="filter-range-label">
                              いつまで
                              <input type="date" className="form-input filter-date" value={filterDueTo} onChange={e => setFilterDueTo(e.target.value)} />
                            </label>
                          </div>
                        )}
                        {sort === 'priority' && (
                          <div className="filter-group">
                            <span className="filter-group-label">重要度ランク:</span>
                            <label className="filter-range-label">
                              から
                              <select className="form-input filter-select" value={filterPriorityFrom} onChange={e => setFilterPriorityFrom(e.target.value)}>
                                <option value="">指定なし</option>
                                {PRIORITY_KEYS.map(k => (
                                  <option key={k} value={k}>{PRIORITY[k].label}</option>
                                ))}
                              </select>
                            </label>
                            <span className="filter-range-sep">〜</span>
                            <label className="filter-range-label">
                              まで
                              <select className="form-input filter-select" value={filterPriorityTo} onChange={e => setFilterPriorityTo(e.target.value)}>
                                <option value="">指定なし</option>
                                {PRIORITY_KEYS.map(k => (
                                  <option key={k} value={k}>{PRIORITY[k].label}</option>
                                ))}
                              </select>
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
                {sortedTasks.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">✨</div>
                    <p>{hasAnyFilter ? '条件に合うタスクがありません' : 'タスクがありません'}</p>
                    {hasAnyFilter ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setFilterProjectIds([])
                          setFilterPriorities([])
                          setFilterAssigneeId('')
                          setFilterDueFrom('')
                          setFilterDueTo('')
                          setFilterPriorityFrom('')
                          setFilterPriorityTo('')
                        }}
                      >
                        絞り込みを解除
                      </button>
                    ) : (
                      <button className="btn btn-primary" onClick={() => setShowTaskForm(true)}>タスクを追加</button>
                    )}
                  </div>
                ) : (
                  <div className="cards-grid cards-grid--compact">
                    {sortedTasks.map(t => (
                      <TaskCard key={t.id} task={t} projects={projects} categories={categories} users={users} onToggle={toggleTask} onClick={() => setEditTask(t)} />
                    ))}
                  </div>
                )}
              </>
            )}

            </div>
          </div>
        </div>
      </div>

      {(showTaskForm || editTask) && (
        <TaskForm
          task={taskFormInitialTask}
          projects={projects}
          templates={templates}
          categories={categories}
          users={users}
          onSave={saveTask}
          onClose={closeTaskForm}
        />
      )}
      {showProjForm && (
        <ProjectForm
          project={editProject}
          onSave={saveProject}
          onClose={() => { setShowProjForm(false); setEditProject(null) }}
        />
      )}
      {showTplForm  && <TemplateForm onSave={saveTemplate} onClose={() => setShowTplForm(false)} />}
      {showClientForm && <ClientForm onSave={addClient} onClose={() => setShowClientForm(false)} />}

      {showSettings && (
        <SettingsModal
          theme={theme}
          setTheme={setTheme}
          onClose={() => setShowSettings(false)}
          categories={categories}
          setCategories={setCategories}
          users={users}
          setUsers={setUsers}
          notifyReminderEnabled={notifyReminderEnabled}
          setNotifyReminderEnabled={setNotifyReminderEnabled}
          addToast={addToast}
        />
      )}

      {showProfileModal && (
        <div className="overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">プロフィール・ログイン</h2>
            {authUser ? (
              <>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                  ログイン中: <strong>{authUser.email ?? authUser.id}</strong>
                </p>
                <div className="modal-actions" style={{ flexWrap: 'wrap', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={async () => {
                      setShowProfileModal(false)
                      try {
                        await signOut()
                        setAuthUser(null)
                      } catch (e) {
                        addToast('❌', 'ログアウトに失敗しました', e?.message ?? '')
                      }
                    }}
                  >
                    ログアウト
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => setShowProfileModal(false)}>閉じる</button>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  外側をクリックしても閉じられます。
                </p>
                <ProfileLoginForm
                  onSuccess={() => setShowProfileModal(false)}
                  onError={addToast}
                />
              </>
            )}
          </div>
        </div>
      )}

      <Toast toasts={toasts} />
    </>
  )
}
