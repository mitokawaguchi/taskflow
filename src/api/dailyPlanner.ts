import { getSupabase, getOwnerId } from './helpers'

export type DailyPlannerRow = {
  todayTaskIds: string[]
  tomorrowTaskIds: string[]
  /** Asia/Tokyo 基準のプラン日（YYYY-MM-DD）。null は未設定 */
  plannerAnchorYmd: string | null
}

function rowFromDb(
  row: { today_task_ids?: unknown; tomorrow_task_ids?: unknown; planner_anchor_ymd?: unknown } | null
): DailyPlannerRow {
  const t = row?.today_task_ids
  const m = row?.tomorrow_task_ids
  const a = row?.planner_anchor_ymd
  const anchor =
    typeof a === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(a.trim()) ? a.trim() : null
  return {
    todayTaskIds: Array.isArray(t) ? (t as string[]).filter((x) => typeof x === 'string') : [],
    tomorrowTaskIds: Array.isArray(m) ? (m as string[]).filter((x) => typeof x === 'string') : [],
    plannerAnchorYmd: anchor,
  }
}

export async function fetchDailyPlanner(): Promise<DailyPlannerRow> {
  const db = getSupabase()
  const ownerId = await getOwnerId()
  if (!ownerId) return { todayTaskIds: [], tomorrowTaskIds: [], plannerAnchorYmd: null }
  const { data, error } = await db
    .from('tf_user_daily_planner')
    .select('today_task_ids, tomorrow_task_ids, planner_anchor_ymd')
    .eq('owner_id', ownerId)
    .maybeSingle()
  if (error) throw error
  return rowFromDb(data ?? null)
}

export async function upsertDailyPlanner(next: DailyPlannerRow): Promise<void> {
  const db = getSupabase()
  const ownerId = await getOwnerId()
  if (!ownerId) return
  const { error } = await db.from('tf_user_daily_planner').upsert(
    {
      owner_id: ownerId,
      today_task_ids: next.todayTaskIds,
      tomorrow_task_ids: next.tomorrowTaskIds,
      planner_anchor_ymd: next.plannerAnchorYmd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'owner_id' }
  )
  if (error) throw error
}
