import { getSupabase, getOwnerId } from './helpers'

export type DailyPlannerRow = {
  todayTaskIds: string[]
  tomorrowTaskIds: string[]
}

function rowFromDb(row: { today_task_ids?: unknown; tomorrow_task_ids?: unknown } | null): DailyPlannerRow {
  const t = row?.today_task_ids
  const m = row?.tomorrow_task_ids
  return {
    todayTaskIds: Array.isArray(t) ? (t as string[]).filter((x) => typeof x === 'string') : [],
    tomorrowTaskIds: Array.isArray(m) ? (m as string[]).filter((x) => typeof x === 'string') : [],
  }
}

export async function fetchDailyPlanner(): Promise<DailyPlannerRow> {
  const db = getSupabase()
  const ownerId = await getOwnerId()
  if (!ownerId) return { todayTaskIds: [], tomorrowTaskIds: [] }
  const { data, error } = await db
    .from('tf_user_daily_planner')
    .select('today_task_ids, tomorrow_task_ids')
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
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'owner_id' }
  )
  if (error) throw error
}
