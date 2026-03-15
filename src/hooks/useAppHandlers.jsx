/**
 * ARCH-001: App.jsx 200行以下化のためフィルタ・アクション・派生値・dueToday 効果を集約
 */
import { useCallback, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { priorityOrder } from '../constants'
import { useTaskFilters } from './useTaskFilters'
import { useTaskActions } from './useTaskActions'
import { useProjectActions } from './useProjectActions'
import { useTemplateActions } from './useTemplateActions'
import { useClientActions } from './useClientActions'
import { isToday, isOverdue } from '../utils'
import ProjectCard from '../components/ProjectCard'

const DUE_TODAY_CHECK_DELAY_MS = 2000
const DUE_TODAY_NOTIFY_THROTTLE_MS = 60 * 60 * 1000
const DUE_TODAY_NOTIFY_STORAGE_KEY = 'taskflow_due_today_notified_at'

function getViewFromPathname(pathname) {
  if (pathname === '/') return 'projects'
  if (pathname === '/all' || pathname === '/tasks') return 'all'
  if (pathname === '/today') return 'today'
  if (pathname === '/overdue') return 'overdue'
  if (pathname === '/kanban') return 'kanban'
  if (pathname === '/dashboard') return 'dashboard'
  if (pathname === '/gantt') return 'gantt'
  if (pathname === '/templates') return 'templates'
  if (pathname === '/clients') return 'clients'
  if (pathname === '/categories') return 'categories'
  const pMatch = pathname.match(/^\/projects\/([^/]+)/)
  if (pMatch) return `p:${pMatch[1]}`
  const cMatch = pathname.match(/^\/clients\/([^/]+)/)
  if (cMatch) return `c:${cMatch[1]}`
  return 'projects'
}

export function useAppHandlers(data, ui, authUser) {
  const { tasks, setTasks, projects, setProjects, categories, users } = data
  const location = useLocation()
  const navigate = useNavigate()
  const view = useMemo(() => getViewFromPathname(location.pathname), [location.pathname])
  const setView = useCallback(
    (v) => {
      if (v === 'projects') navigate('/')
      else if (v === 'all') navigate('/all')
      else if (v === 'today') navigate('/today')
      else if (v === 'overdue') navigate('/overdue')
      else if (v === 'kanban') navigate('/kanban')
      else if (v === 'dashboard') navigate('/dashboard')
      else if (v === 'gantt') navigate('/gantt')
      else if (v === 'templates') navigate('/templates')
      else if (v === 'clients') navigate('/clients')
      else if (v === 'categories') navigate('/categories')
      else if (v.startsWith('p:')) navigate(`/projects/${v.slice(2)}`)
      else if (v.startsWith('c:')) navigate(`/clients/${v.slice(2)}`)
      else navigate('/')
    },
    [navigate]
  )

  const taskFilters = useTaskFilters(tasks, view, ui.showDone, ui.searchQuery)
  const { sort, setSort, filterProjectIds, filterPriorities, filterDueFrom, filterDueTo, filterPriorityFrom, filterPriorityTo, filterOpen, setFilterOpen, filterAssigneeId, setFilterAssigneeId, hasAnyFilter, sortedTasks, clearFilters: taskFiltersClear } = taskFilters

  const { saveTask, toggleTask, moveTaskStatus } = useTaskActions(tasks, setTasks, ui.addToast, ui.editTask, ui.closeTaskForm)
  const openTaskFormForKanbanColumn = useCallback(
    (columnStatus) => {
      ui.setKanbanAddStatus(columnStatus)
      ui.setEditTask(null)
      ui.setTaskFormProjectId(null)
      ui.setShowTaskForm(true)
    },
    [ui]
  )
  const { saveTemplate, removeTemplate } = useTemplateActions(data.setTemplates, ui.addToast, ui.setShowTplForm, ui.setEditTemplate)
  const { saveClient, removeClient, addRemember, updateRememberItem, removeRemember } = useClientActions(
    data.remembers,
    data.setClients,
    data.setRemembers,
    ui.addToast,
    ui.setShowClientForm,
    ui.setEditClient,
    location.pathname,
    navigate
  )

  const todayCount = tasks.filter((t) => !t.done && isToday(t.due)).length
  const overdueCount = tasks.filter((t) => !t.done && isOverdue(t.due)).length
  const viewTitle = useCallback(() => {
    if (view === 'all') return 'すべてのタスク'
    if (view === 'today') return '今日のタスク'
    if (view === 'overdue') return '期限超過'
    if (view === 'kanban') return 'カンバン'
    if (view === 'dashboard') return 'ダッシュボード'
    if (view === 'gantt') return 'タイムライン'
    if (view === 'projects') return 'プロジェクト'
    if (view === 'templates') return 'テンプレート'
    if (view === 'clients') return '覚えておくこと'
    if (view === 'categories') return 'カテゴリ'
    if (view.startsWith('c:')) return data.clients.find((c) => c.id === view.slice(2))?.name ?? 'クライアント'
    if (view.startsWith('p:')) return projects.find((p) => p.id === view.slice(2))?.name ?? ''
    return ''
  }, [view, projects, data.clients])
  const openTaskFormForProject = useCallback((projectId) => {
    ui.setTaskFormProjectId(projectId)
    ui.setShowTaskForm(true)
  }, [ui])

  const { activeProjects, completedProjects } = useMemo(() => {
    const withStats = (projects || []).map((p) => {
      const ptasks = (tasks || []).filter((t) => t.projectId === p.id).slice().sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2))
      const done = ptasks.filter((t) => t.done).length
      const pct = ptasks.length ? Math.round((done / ptasks.length) * 100) : 0
      return { project: p, ptasks, pct }
    })
    return {
      activeProjects: withStats.filter(({ ptasks, pct }) => ptasks.length === 0 || pct < 100),
      completedProjects: withStats.filter(({ ptasks, pct }) => ptasks.length > 0 && pct === 100),
    }
  }, [projects, tasks])

  const { saveProject, updateProjectEndDate, handleProjectDragEnd } = useProjectActions(
    projects,
    setProjects,
    activeProjects,
    completedProjects,
    ui.addToast,
    ui.editProject,
    ui.setShowProjForm,
    ui.setEditProject
  )
  const renderProjectCard = useCallback(
    ({ project, ptasks, pct }) => (
      <ProjectCard
        key={project.id}
        project={project}
        ptasks={ptasks}
        pct={pct}
        onViewProject={(id) => setView(`p:${id}`)}
        onToggleTask={toggleTask}
        onAddTask={openTaskFormForProject}
      />
    ),
    [toggleTask, openTaskFormForProject, setView]
  )
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const isProjectView = view.startsWith('p:')
  const currentProject = isProjectView ? projects.find((p) => p.id === view.slice(2)) : null
  const isMainView = ['kanban', 'gantt', 'dashboard', 'all', 'today', 'overdue', 'projects', 'templates'].includes(view) || isProjectView
  const viewTabs = [
    { key: 'kanban', label: 'カンバン', icon: '📌' },
    { key: 'gantt', label: 'タイムライン', icon: '📅' },
    { key: 'dashboard', label: 'インサイト', icon: '📊' },
  ]
  const activeFilterCount = [filterProjectIds.length, filterPriorities.length, filterDueFrom, filterDueTo, filterPriorityFrom, filterPriorityTo, filterAssigneeId].filter(Boolean).length
  const tasksForBoard = useMemo(() => {
    let list = tasks
    if (ui.searchQuery.trim()) {
      const q = ui.searchQuery.trim().toLowerCase()
      list = list.filter((t) => (t.title && t.title.toLowerCase().includes(q)) || (t.desc && String(t.desc).toLowerCase().includes(q)))
    }
    if (currentProject) list = list.filter((t) => t.projectId === currentProject.id)
    return list
  }, [tasks, ui.searchQuery, currentProject])
  const taskFormInitialTask = useMemo(() => {
    if (ui.editTask) return ui.editTask
    const projectId = ui.taskFormProjectId ?? (isProjectView ? view.slice(2) : null)
    const status = ui.kanbanAddStatus ?? null
    return projectId || status ? { projectId: projectId || null, status } : null
  }, [ui.editTask, ui.taskFormProjectId, isProjectView, view, ui.kanbanAddStatus])
  const usersForTaskForm = useMemo(() => {
    if (!authUser) return users
    if (users.some((u) => u.id === authUser.id)) return users
    return [
      { id: authUser.id, name: authUser.user_metadata?.display_name || authUser.email || '自分', email: authUser.email ?? '' },
      ...users,
    ]
  }, [users, authUser])
  const projectsMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects])
  const usersMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users])

  const requestNotif = useCallback(async () => {
    if (typeof globalThis.Notification === 'undefined') return
    const permission = await globalThis.Notification.requestPermission()
    if (permission === 'granted') {
      ui.setNotifGranted(true)
      ui.addToast('🔔', '通知が有効になりました', '期限が近いタスクをお知らせします')
    }
  }, [ui])

  useEffect(() => {
    const checkDueToday = () => {
      const dueToday = tasks.filter((t) => !t.done && isToday(t.due))
      if (dueToday.length === 0 || !ui.notifyReminderEnabled) return
      const now = Date.now()
      const lastAt = Number.parseInt(localStorage.getItem(DUE_TODAY_NOTIFY_STORAGE_KEY) ?? '0', 10)
      if (now - lastAt < DUE_TODAY_NOTIFY_THROTTLE_MS) return
      localStorage.setItem(DUE_TODAY_NOTIFY_STORAGE_KEY, String(now))
      ui.addToast('⚠️', `今日が期限: ${dueToday.length}件`, dueToday.map((t) => t.title).join('、'))
      if (ui.notifGranted) {
        new globalThis.Notification('TaskFlow — 今日の期限', { body: dueToday.map((t) => t.title).join('\n') })
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 400])
      }
    }
    const timer = setTimeout(checkDueToday, DUE_TODAY_CHECK_DELAY_MS)
    return () => clearTimeout(timer)
  }, [tasks, ui.notifGranted, ui.addToast, ui.notifyReminderEnabled])

  return {
    view,
    setView,
    sort,
    setSort,
    filterProjectIds,
    setFilterProjectIds,
    filterPriorities,
    setFilterPriorities,
    filterDueFrom,
    setFilterDueFrom,
    filterDueTo,
    setFilterDueTo,
    filterPriorityFrom,
    setFilterPriorityFrom,
    filterPriorityTo,
    setFilterPriorityTo,
    filterOpen,
    setFilterOpen,
    filterAssigneeId,
    setFilterAssigneeId,
    hasAnyFilter,
    sortedTasks,
    taskFiltersClear,
    saveTask,
    toggleTask,
    moveTaskStatus,
    openTaskFormForKanbanColumn,
    saveTemplate,
    removeTemplate,
    saveClient,
    removeClient,
    addRemember,
    updateRememberItem,
    removeRemember,
    todayCount,
    overdueCount,
    viewTitle,
    openTaskFormForProject,
    activeProjects,
    completedProjects,
    saveProject,
    updateProjectEndDate,
    handleProjectDragEnd,
    renderProjectCard,
    sensors,
    isProjectView,
    currentProject,
    isMainView,
    viewTabs,
    activeFilterCount,
    tasksForBoard,
    taskFormInitialTask,
    usersForTaskForm,
    projectsMap,
    usersMap,
    requestNotif,
  }
}
