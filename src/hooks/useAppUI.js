/**
 * ARCH-001: App.jsx 200行以下化のため UI 状態・addToast・theme/legalPage 効果を集約
 */
import { useState, useEffect, useCallback } from 'react'
import { getLegalPageFromHash } from '../legalContent'
import { today } from '../utils'
import { ACCENT_STORAGE_KEY, applyAccentToDocument, parseHexColor } from '../utils/accentColor'

const TOAST_DURATION_MS = 2400

function readStoredAccentHex() {
  const raw = localStorage.getItem(ACCENT_STORAGE_KEY) ?? ''
  const t = raw.trim()
  if (!t) return ''
  const withHash = t.startsWith('#') ? t : `#${t}`
  return parseHexColor(withHash) ? withHash.toLowerCase() : ''
}

export function useAppUI() {
  const [showClientForm, setShowClientForm] = useState(false)
  const [editClient, setEditClient] = useState(null)
  const [sidebarProjectsOpen, setSidebarProjectsOpen] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [taskFormProjectId, setTaskFormProjectId] = useState(null)
  const [showProjForm, setShowProjForm] = useState(false)
  const [editProject, setEditProject] = useState(null)
  const [showTplForm, setShowTplForm] = useState(false)
  const [editTemplate, setEditTemplate] = useState(null)
  const [toasts, setToasts] = useState([])
  const [showDone, setShowDone] = useState(false)
  const [notifGranted, setNotifGranted] = useState(false)
  const [showMorning, setShowMorning] = useState(() => localStorage.getItem('tf_morning') !== today())
  const [theme, setTheme] = useState(() => localStorage.getItem('taskflow_theme') || 'light')
  const [accentHex, setAccentHex] = useState(readStoredAccentHex)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [notifyReminderEnabled, setNotifyReminderEnabled] = useState(
    () => localStorage.getItem('taskflow_notify_reminder') !== 'false'
  )
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [legalPage, setLegalPage] = useState(() => getLegalPageFromHash())
  const [kanbanAddStatus, setKanbanAddStatus] = useState(null)
  const [dragActiveId, setDragActiveId] = useState(null)
  /** メモ詳細画面のタイトル（TopBar 用） */
  const [noteDetailTitle, setNoteDetailTitle] = useState(null)
  /** 完了直後に「次のタスク」を促すモーダル用 */
  const [completeNextTask, setCompleteNextTask] = useState(null)

  useEffect(() => {
    const onHash = () => setLegalPage(getLegalPageFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('taskflow_theme', theme)
  }, [theme])

  useEffect(() => {
    const trimmed = accentHex.trim()
    const mode = theme === 'dark' ? 'dark' : 'light'
    if (!trimmed) {
      applyAccentToDocument(null, mode)
      localStorage.removeItem(ACCENT_STORAGE_KEY)
      return
    }
    const candidate = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
    if (!parseHexColor(candidate)) {
      applyAccentToDocument(null, mode)
      localStorage.removeItem(ACCENT_STORAGE_KEY)
      return
    }
    applyAccentToDocument(candidate.toLowerCase(), mode)
    localStorage.setItem(ACCENT_STORAGE_KEY, candidate.toLowerCase())
  }, [accentHex, theme])

  useEffect(() => {
    localStorage.setItem('taskflow_notify_reminder', notifyReminderEnabled ? 'true' : 'false')
  }, [notifyReminderEnabled])

  useEffect(() => {
    if (typeof globalThis.window !== 'undefined' && 'Notification' in globalThis && globalThis.Notification.permission === 'granted') {
      setNotifGranted(true)
    }
  }, [])

  const addToast = useCallback((icon, title, msg) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, icon, title, msg }])
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), TOAST_DURATION_MS)
  }, [])

  const closeTaskForm = useCallback(() => {
    setShowTaskForm(false)
    setEditTask(null)
    setTaskFormProjectId(null)
    setKanbanAddStatus(null)
  }, [])

  return {
    showClientForm,
    setShowClientForm,
    editClient,
    setEditClient,
    sidebarProjectsOpen,
    setSidebarProjectsOpen,
    sidebarOpen,
    setSidebarOpen,
    showTaskForm,
    setShowTaskForm,
    editTask,
    setEditTask,
    taskFormProjectId,
    setTaskFormProjectId,
    showProjForm,
    setShowProjForm,
    editProject,
    setEditProject,
    showTplForm,
    setShowTplForm,
    editTemplate,
    setEditTemplate,
    toasts,
    setToasts,
    showDone,
    setShowDone,
    notifGranted,
    setNotifGranted,
    showMorning,
    setShowMorning,
    theme,
    setTheme,
    accentHex,
    setAccentHex,
    searchQuery,
    setSearchQuery,
    showSettings,
    setShowSettings,
    notifyReminderEnabled,
    setNotifyReminderEnabled,
    showProfileModal,
    setShowProfileModal,
    legalPage,
    setLegalPage,
    kanbanAddStatus,
    setKanbanAddStatus,
    dragActiveId,
    setDragActiveId,
    noteDetailTitle,
    setNoteDetailTitle,
    addToast,
    closeTaskForm,
    completeNextTask,
    setCompleteNextTask,
  }
}
