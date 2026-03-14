import { useState, useMemo, useCallback } from 'react'
import { priorityOrder } from '../constants'
import { isToday, isOverdue } from '../utils'

/**
 * タスク一覧の絞り込み・ソート state と sortedTasks を集約。ARCH-003
 * @param {Array} tasks - 全タスク
 * @param {string} view - 'all' | 'today' | 'overdue'
 * @param {boolean} showDone - 完了タスクを表示するか
 * @param {string} searchQuery - 検索文字列
 */
export function useTaskFilters(tasks, view, showDone, searchQuery) {
  const [sort, setSort] = useState('priority')
  const [filterProjectIds, setFilterProjectIds] = useState([])
  const [filterPriorities, setFilterPriorities] = useState([])
  const [filterDueFrom, setFilterDueFrom] = useState('')
  const [filterDueTo, setFilterDueTo] = useState('')
  const [filterPriorityFrom, setFilterPriorityFrom] = useState('')
  const [filterPriorityTo, setFilterPriorityTo] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterAssigneeId, setFilterAssigneeId] = useState('')

  const hasAnyFilter =
    filterProjectIds.length > 0 ||
    filterPriorities.length > 0 ||
    !!filterDueFrom ||
    !!filterDueTo ||
    !!filterPriorityFrom ||
    !!filterPriorityTo ||
    !!filterAssigneeId

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (!showDone && t.done) return false
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const matchTitle = t.title && t.title.toLowerCase().includes(q)
        const matchDesc = (t.desc ?? t.notes) && String(t.desc ?? t.notes).toLowerCase().includes(q)
        if (!matchTitle && !matchDesc) return false
      }
      if (view === 'all') {
        /* continue */
      } else if (view === 'today') {
        if (!isToday(t.due)) return false
      } else if (view === 'overdue') {
        if (!isOverdue(t.due) || t.done) return false
      } else {
        return true
      }
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
  }, [
    tasks,
    view,
    showDone,
    searchQuery,
    filterProjectIds,
    filterPriorities,
    filterDueFrom,
    filterDueTo,
    filterPriorityFrom,
    filterPriorityTo,
    filterAssigneeId,
  ])

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sort === 'priority') return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
      if (sort === 'due') return (a.due || '9999') < (b.due || '9999') ? -1 : 1
      if (sort === 'created') return (b.created ?? 0) - (a.created ?? 0)
      if (sort === 'name') return (a.title || '').localeCompare(b.title || '')
      return 0
    })
  }, [filteredTasks, sort])

  const clearFilters = useCallback(() => {
    setFilterProjectIds([])
    setFilterPriorities([])
    setFilterAssigneeId('')
    setFilterDueFrom('')
    setFilterDueTo('')
    setFilterPriorityFrom('')
    setFilterPriorityTo('')
  }, [])

  return {
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
    clearFilters,
  }
}
