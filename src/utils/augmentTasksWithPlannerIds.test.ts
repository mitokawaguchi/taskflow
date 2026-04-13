import { describe, it, expect, vi, beforeEach } from 'vitest'
import { augmentTasksWithPlannerIds } from './augmentTasksWithPlannerIds'
import * as tasksApi from '../api/tasks'

vi.mock('../api/tasks', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../api/tasks')>()
  return { ...mod, fetchTasksByIds: vi.fn() }
})

describe('augmentTasksWithPlannerIds', () => {
  beforeEach(() => {
    vi.mocked(tasksApi.fetchTasksByIds).mockReset()
  })

  it('不足 ID が無ければそのまま返す', async () => {
    const t = [{ id: 'a', title: 'A' }] as import('../types').Task[]
    const r = await augmentTasksWithPlannerIds(t, ['a'], [])
    expect(r).toBe(t)
    expect(tasksApi.fetchTasksByIds).not.toHaveBeenCalled()
  })

  it('一覧に無いプラン ID 分を追加取得してマージする', async () => {
    const t = [{ id: 'a', title: 'A' }] as import('../types').Task[]
    vi.mocked(tasksApi.fetchTasksByIds).mockResolvedValue([{ id: 'old', title: 'O' } as import('../types').Task])
    const r = await augmentTasksWithPlannerIds(t, ['a', 'old'], [])
    expect(tasksApi.fetchTasksByIds).toHaveBeenCalledWith(['old'])
    expect(r.map((x) => x.id)).toEqual(['a', 'old'])
  })
})
