import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTaskFilters } from './useTaskFilters'

describe('useTaskFilters', () => {
  const tasks = [
    { id: '1', title: 'A', due: '2026-03-15', done: false, projectId: 'p1', priority: 'high', assigneeId: '', created: 1 },
    { id: '2', title: 'B', due: '2026-03-20', done: false, projectId: 'p1', priority: 'low', assigneeId: '', created: 2 },
    { id: '3', title: 'C', due: '2026-03-10', done: true, projectId: 'p2', priority: 'medium', assigneeId: '', created: 3 },
    { id: '4', title: 'D', due: '2026-03-01', done: false, projectId: 'p1', priority: 'medium', assigneeId: '', created: 4 },
  ]

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-15'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns sortedTasks filtered by view today when view is today', () => {
    const { result } = renderHook(() =>
      useTaskFilters(tasks, 'today', true, '')
    )
    expect(result.current.sortedTasks).toHaveLength(1)
    expect(result.current.sortedTasks[0].title).toBe('A')
  })

  it('returns all tasks for view all when showDone true', () => {
    const { result } = renderHook(() =>
      useTaskFilters(tasks, 'all', true, '')
    )
    expect(result.current.sortedTasks).toHaveLength(4)
  })

  it('filters by searchQuery', () => {
    const { result } = renderHook(() =>
      useTaskFilters(tasks, 'all', true, 'B')
    )
    expect(result.current.sortedTasks).toHaveLength(1)
    expect(result.current.sortedTasks[0].title).toBe('B')
  })

  it('clearFilters resets filter state', () => {
    const { result } = renderHook(() =>
      useTaskFilters(tasks, 'all', true, '')
    )
    act(() => {
      result.current.setFilterProjectIds(['p1'])
      result.current.setSort('due')
    })
    expect(result.current.hasAnyFilter).toBe(true)
    act(() => {
      result.current.clearFilters()
    })
    expect(result.current.filterProjectIds).toEqual([])
  })

  it('filters by view overdue (only incomplete and overdue)', () => {
    const { result } = renderHook(() =>
      useTaskFilters(tasks, 'overdue', true, '')
    )
    expect(result.current.sortedTasks).toHaveLength(1)
    expect(result.current.sortedTasks[0].id).toBe('4')
  })

  it('filters by filterProjectIds and filterPriorities combined', () => {
    const { result } = renderHook(() =>
      useTaskFilters(tasks, 'all', true, '')
    )
    act(() => {
      result.current.setFilterProjectIds(['p1'])
      result.current.setFilterPriorities(['high'])
    })
    expect(result.current.sortedTasks).toHaveLength(1)
    expect(result.current.sortedTasks[0].title).toBe('A')
    expect(result.current.hasAnyFilter).toBe(true)
  })
})
