import { useEffect, useMemo } from 'react'

/**
 * 今日・明日プランのタスク ID は、検索や「完了を表示」で一覧から消えても state 上は維持する。
 * 同期で取り除くのは DB に存在しない（削除済み）ID のみ。
 */
export function usePlannerTaskRegistry(tasksAll, setDailyPlanner) {
  const tasksById = useMemo(() => new Map(tasksAll.map((t) => [t.id, t])), [tasksAll])

  useEffect(() => {
    if (!tasksAll.length) return
    setDailyPlanner((prev) => {
      const ids = new Set(tasksAll.map((t) => t.id))
      const ta = prev.todayTaskIds.filter((i) => ids.has(i))
      const tb = prev.tomorrowTaskIds.filter((i) => ids.has(i))
      if (ta.length === prev.todayTaskIds.length && tb.length === prev.tomorrowTaskIds.length) return prev
      return {
        todayTaskIds: ta,
        tomorrowTaskIds: tb,
        plannerAnchorYmd: prev.plannerAnchorYmd ?? null,
      }
    })
  }, [tasksAll, setDailyPlanner])

  return tasksById
}
