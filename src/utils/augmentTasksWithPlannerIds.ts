import type { Task } from '../types'
import { fetchTasksByIds } from '../api/tasks'

/** 今日・明日プランの ID が fetchTasks の件数上限で欠けているとき、不足分だけ追加取得してマージする */
export async function augmentTasksWithPlannerIds(
  tasks: Task[],
  todayTaskIds: string[],
  tomorrowTaskIds: string[]
): Promise<Task[]> {
  const want = new Set([...todayTaskIds, ...tomorrowTaskIds])
  const missing = [...want].filter((id) => !tasks.some((t) => t.id === id))
  if (missing.length === 0) return tasks
  const extra = await fetchTasksByIds(missing)
  const seen = new Set(tasks.map((t) => t.id))
  return [...tasks, ...extra.filter((t) => !seen.has(t.id))]
}
