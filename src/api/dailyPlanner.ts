import { getSupabase, getOwnerId } from './helpers'

export type DailyPlannerRow = {
  todayTaskIds: string[]
  tomorrowTaskIds: string[]
  /** Asia/Tokyo 基準のプラン日（YYYY-MM-DD）。null は未設定 */
  plannerAnchorYmd: string | null
}

/**
 * planner_anchor_ymd は「日付またぎ検知」専用のクライアント情報なので
 * DB カラムに依存せず localStorage に保持する。
 * DB には today_task_ids / tomorrow_task_ids の 2 列だけ書き込む。
 */
const ANCHOR_KEY = 'tf_planner_anchor_ymd'

function getStoredAnchor(): string | null {
  try {
    const v = localStorage.getItem(ANCHOR_KEY)
    return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null
  } catch {
    return null
  }
}

function setStoredAnchor(ymd: string | null): void {
  try {
    if (ymd) localStorage.setItem(ANCHOR_KEY, ymd)
    else localStorage.removeItem(ANCHOR_KEY)
  } catch {
    // localStorage が使えない環境では無視
  }
}

function rowFromDb(
  row: { today_task_ids?: unknown; tomorrow_task_ids?: unknown } | null
): Pick<DailyPlannerRow, 'todayTaskIds' | 'tomorrowTaskIds'> {
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
  if (!ownerId) return { todayTaskIds: [], tomorrowTaskIds: [], plannerAnchorYmd: null }
  const { data, error } = await db
    .from('tf_user_daily_planner')
    .select('today_task_ids, tomorrow_task_ids')
    .eq('owner_id', ownerId)
    .maybeSingle()
  if (error) throw error
  return {
    ...rowFromDb(data ?? null),
    plannerAnchorYmd: getStoredAnchor(),
  }
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
  setStoredAnchor(next.plannerAnchorYmd)
}
