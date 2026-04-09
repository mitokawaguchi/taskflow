import { getSupabase, getOwnerId } from './helpers'
import type { HypothesisResultItem, WeeklyReview } from '../types'

interface WeeklyReviewRow {
  id: string
  owner_id: string
  week_start: string
  week_end: string
  top_achievements?: unknown
  wasted_efforts?: unknown
  hypothesis_results?: unknown
  next_week_focus?: unknown
  growth_note?: string | null
  created_at?: string
  updated_at?: string
}

function rowFromWeeklyReview(r: WeeklyReviewRow | null): WeeklyReview | null {
  if (!r) return null
  const hr = Array.isArray(r.hypothesis_results) ? r.hypothesis_results : []
  const safeHr = hr.filter(
    (x): x is HypothesisResultItem =>
      x != null &&
      typeof x === 'object' &&
      typeof (x as HypothesisResultItem).hypothesis === 'string' &&
      ['hit', 'miss', 'partial'].includes(String((x as HypothesisResultItem).result))
  )
  return {
    id: r.id,
    ownerId: r.owner_id,
    weekStart: r.week_start,
    weekEnd: r.week_end,
    topAchievements: Array.isArray(r.top_achievements) ? r.top_achievements : [],
    wastedEfforts: Array.isArray(r.wasted_efforts) ? r.wasted_efforts : [],
    hypothesisResults: safeHr,
    nextWeekFocus: Array.isArray(r.next_week_focus) ? r.next_week_focus : [],
    growthNote: r.growth_note ?? null,
    createdAt: r.created_at ?? '',
    updatedAt: r.updated_at ?? '',
  }
}

export async function fetchWeeklyReviews(): Promise<WeeklyReview[]> {
  const db = getSupabase()
  const ownerId = await getOwnerId()
  let q = db.from('weekly_reviews').select('*').order('week_start', { ascending: false }).limit(52)
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q
  if (error) throw error
  const rows = (data ?? []) as WeeklyReviewRow[]
  return rows.map((r) => rowFromWeeklyReview(r)).filter((x): x is WeeklyReview => x != null)
}

export type WeeklyReviewUpsert = Omit<WeeklyReview, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'> & {
  id?: string
}

export async function upsertWeeklyReview(input: WeeklyReviewUpsert): Promise<WeeklyReview> {
  const db = getSupabase()
  const ownerId = await getOwnerId()
  if (!ownerId) throw new Error('ログインが必要です')
  const row: Record<string, unknown> = {
    week_start: input.weekStart,
    week_end: input.weekEnd,
    top_achievements: input.topAchievements ?? [],
    wasted_efforts: input.wastedEfforts ?? [],
    hypothesis_results: input.hypothesisResults ?? [],
    next_week_focus: input.nextWeekFocus ?? [],
    growth_note: input.growthNote ?? null,
    owner_id: ownerId,
    updated_at: new Date().toISOString(),
  }
  if (input.id) {
    const { data, error } = await db.from('weekly_reviews').update(row).eq('id', input.id).select().single()
    if (error) throw error
    const w = rowFromWeeklyReview(data as WeeklyReviewRow)
    if (!w) throw new Error('upsertWeeklyReview: no data')
    return w
  }
  const { data, error } = await db.from('weekly_reviews').insert(row).select().single()
  if (error) throw error
  const w = rowFromWeeklyReview(data as WeeklyReviewRow)
  if (!w) throw new Error('upsertWeeklyReview: no data')
  return w
}
