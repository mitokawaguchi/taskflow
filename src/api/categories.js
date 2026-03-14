import { supabase } from '../supabase'
import { requireSupabase, getOwnerId, categoryFromRow } from './helpers'

export async function fetchCategories() {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_categories').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.order('id')
  if (error) throw error
  return (data ?? []).map(categoryFromRow)
}

export async function insertCategory(category) {
  requireSupabase()
  const ownerId = await getOwnerId()
  const row = {
    id: category.id,
    name: category.name,
    color: category.color ?? '#6b7280',
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_categories').insert(row).select().single()
  if (error) throw error
  return categoryFromRow(data)
}
