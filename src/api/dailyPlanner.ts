import { getSupabase, getOwnerId } from './helpers'

export type DailyPlannerRow = {
  todayTaskIds: string[]
  tomorrowTaskIds: string[]
  plannerAnchorYmd: string | null
}

const ANCHOR_KEY = 'tf_planner_anchor_ymd'
const CACHE_KEY = 'tf_daily_planner_cache'

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
  } catch { /* noop */ }
}

interface CacheEntry {
  todayTaskIds: string[]
  tomorrowTaskIds: string[]
  ts: number
}

/** localStorage へ即時保存（ページ離脱でも消えない） */
function cacheLocally(data: DailyPlannerRow): void {
  try {
    const entry: CacheEntry = {
      todayTaskIds: data.todayTaskIds,
      tomorrowTaskIds: data.tomorrowTaskIds,
      ts: Date.now(),
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch { /* noop */ }
}

function readLocalCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === 'object' &&
      'todayTaskIds' in parsed &&
      Array.isArray((parsed as CacheEntry).todayTaskIds) &&
      'ts' in parsed
    ) {
      const c = parsed as CacheEntry
      return {
        todayTaskIds: c.todayTaskIds.filter((x): x is string => typeof x === 'string'),
        tomorrowTaskIds: Array.isArray(c.tomorrowTaskIds)
          ? c.tomorrowTaskIds.filter((x): x is string => typeof x === 'string')
          : [],
        ts: typeof c.ts === 'number' ? c.ts : 0,
      }
    }
    return null
  } catch {
    return null
  }
}

function rowFromDb(
  row: { today_task_ids?: unknown; tomorrow_task_ids?: unknown; updated_at?: unknown } | null
): { todayTaskIds: string[]; tomorrowTaskIds: string[]; updatedAt: number } {
  const t = row?.today_task_ids
  const m = row?.tomorrow_task_ids
  const ua = row?.updated_at
  let updatedAt = 0
  if (typeof ua === 'string') {
    const d = Date.parse(ua)
    if (Number.isFinite(d)) updatedAt = d
  }
  return {
    todayTaskIds: Array.isArray(t) ? (t as string[]).filter((x) => typeof x === 'string') : [],
    tomorrowTaskIds: Array.isArray(m) ? (m as string[]).filter((x) => typeof x === 'string') : [],
    updatedAt,
  }
}

function hasContent(ids: string[]): boolean {
  return ids.length > 0
}

export async function fetchDailyPlanner(): Promise<DailyPlannerRow> {
  const db = getSupabase()
  const ownerId = await getOwnerId()
  if (!ownerId) return { todayTaskIds: [], tomorrowTaskIds: [], plannerAnchorYmd: null }
  const { data, error } = await db
    .from('tf_user_daily_planner')
    .select('today_task_ids, tomorrow_task_ids, updated_at')
    .eq('owner_id', ownerId)
    .maybeSingle()
  if (error) throw error

  const dbRow = rowFromDb(data ?? null)
  const cache = readLocalCache()

  let todayTaskIds: string[]
  let tomorrowTaskIds: string[]

  const dbHas = hasContent(dbRow.todayTaskIds) || hasContent(dbRow.tomorrowTaskIds)
  const cacheHas = cache && (hasContent(cache.todayTaskIds) || hasContent(cache.tomorrowTaskIds))

  if (dbHas && cacheHas) {
    if (cache.ts > dbRow.updatedAt) {
      todayTaskIds = cache.todayTaskIds
      tomorrowTaskIds = cache.tomorrowTaskIds
    } else {
      todayTaskIds = dbRow.todayTaskIds
      tomorrowTaskIds = dbRow.tomorrowTaskIds
    }
  } else if (cacheHas && cache) {
    todayTaskIds = cache.todayTaskIds
    tomorrowTaskIds = cache.tomorrowTaskIds
  } else {
    todayTaskIds = dbRow.todayTaskIds
    tomorrowTaskIds = dbRow.tomorrowTaskIds
  }

  const result: DailyPlannerRow = { todayTaskIds, tomorrowTaskIds, plannerAnchorYmd: getStoredAnchor() }
  cacheLocally(result)
  return result
}

export async function upsertDailyPlanner(next: DailyPlannerRow): Promise<void> {
  cacheLocally(next)
  setStoredAnchor(next.plannerAnchorYmd)

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
