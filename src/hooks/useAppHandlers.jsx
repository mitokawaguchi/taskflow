/**
 * ARCH-001: App.jsx 200行以下化のためフィルタ・アクション・派生値・dueToday 効果を集約
 */
import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { priorityOrder, VIEW_TABS } from '../constants'
import { useTaskFilters } from './useTaskFilters'
import { useTaskActions } from './useTaskActions'
import { useProjectActions } from './useProjectActions'
import { useTemplateActions } from './useTemplateActions'
import { useClientActions } from './useClientActions'
import { isToday, isOverdue, filterTasksForBoard } from '../utils'
import ProjectCard from '../components/ProjectCard'
import { getViewFromPathname, navigateToView } from '../utils/viewRouting'
import { getViewTitle } from '../utils/viewTitle'
import { useDueTodayNotification } from './useDueTodayNotification'

export function useAppHandlers(data, ui, authUser) {
  const { tasks, setTasks, projects, setProjects, users } = data
  const location = useLocation()
  const navigate = useNavigate()
  const view = useMemo(() => getViewFromPathname(location.pathname), [location.pathname])
  const setView = useCallback((v) => navigateToView(navigate, v), [navigate])

  const taskFilters = useTaskFilters(tasks, view, ui.showDone, ui.searchQuery)
  const { sort, setSort, filterProjectIds, setFilterProjectIds, filterPriorities, setFilterPriorities, filterDueFrom, setFilterDueFrom, filterDueTo, setFilterDueTo, filterPriorityFrom, setFilterPriorityFrom, filterPriorityTo, setFilterPriorityTo, filterOpen, setFilterOpen, filterAssigneeId, setFilterAssigneeId, hasAnyFilter, sortedTasks, clearFilters: taskFiltersClear } = taskFilters

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
    return getViewTitle(view, {
      projects,
      clients: data.clients,
    })
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
  const viewTabs = VIEW_TABS
  const activeFilterCount = [filterProjectIds.length, filterPriorities.length, filterDueFrom, filterDueTo, filterPriorityFrom, filterPriorityTo, filterAssigneeId].filter(Boolean).length
  const tasksForBoard = useMemo(() => filterTasksForBoard(tasks, ui.searchQuery, currentProject), [tasks, ui.searchQuery, currentProject])
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
  useDueTodayNotification(tasks, ui)
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
