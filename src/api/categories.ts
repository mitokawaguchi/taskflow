import { supabase } from '../supabase'
import { requireSupabase, getOwnerId, categoryFromRow } from './helpers'
import type { Category } from '../types'

export async function fetchCategories(): Promise<Category[]> {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_categories').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.order('id')
  if (error) throw error
  const rows = (data ?? []) as Array<{ id: string; name?: string | null; color?: string | null }>
  return rows.map((row) => categoryFromRow(row)).filter((c): c is Category => c != null)
}

export async function insertCategory(category: { id: string; name: string; color?: string }): Promise<Category> {
  requireSupabase()
  const ownerId = await getOwnerId()
  const row: Record<string, unknown> = {
    id: category.id,
    name: category.name,
    color: category.color ?? '#6b7280',
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_categories').insert(row).select().single()
  if (error) throw error
  const result = categoryFromRow(data)
  if (!result) throw new Error('insertCategory: no data returned')
  return result
}
