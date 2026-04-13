import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePlannerTaskRegistry } from './usePlannerTaskRegistry'

describe('usePlannerTaskRegistry', () => {
  it('削除されたタスク ID だけプランから除く', () => {
    const setDailyPlanner = vi.fn()
    const tasks = [{ id: 'a', title: 'A' }]
    renderHook(() => usePlannerTaskRegistry(tasks, setDailyPlanner))
    expect(setDailyPlanner).toHaveBeenCalled()
    const updater = setDailyPlanner.mock.calls[0][0]
    const next = updater({
      todayTaskIds: ['a', 'gone'],
      tomorrowTaskIds: [],
      plannerAnchorYmd: null,
    })
    expect(next.todayTaskIds).toEqual(['a'])
    expect(next.tomorrowTaskIds).toEqual([])
  })

  it('変更が無いときは同じ参照を返す', () => {
    const setDailyPlanner = vi.fn()
    const tasks = [{ id: 'a', title: 'A' }]
    renderHook(() => usePlannerTaskRegistry(tasks, setDailyPlanner))
    const updater = setDailyPlanner.mock.calls[0][0]
    const prev = { todayTaskIds: ['a'], tomorrowTaskIds: [], plannerAnchorYmd: null }
    expect(updater(prev)).toBe(prev)
  })
})
