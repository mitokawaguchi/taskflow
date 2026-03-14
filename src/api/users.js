import { supabase } from '../supabase'
import { requireSupabase, getOwnerId, userFromRow } from './helpers'

export async function fetchUsers() {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_users').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.order('created', { ascending: false })
  if (error) throw error
  return (data ?? []).map(userFromRow)
}

export async function insertUser(user) {
  requireSupabase()
  const ownerId = await getOwnerId()
  const row = {
    id: user.id,
    name: user.name,
    email: user.email || null,
    avatar_url: user.avatarUrl || null,
    created: user.created,
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_users').insert(row).select().single()
  if (error) throw error
  return userFromRow(data)
}

export async function updateUser(id, patch) {
  requireSupabase()
  const row = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.email !== undefined) row.email = patch.email || null
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl || null
  const { data, error } = await supabase.from('tf_users').update(row).eq('id', id).select().single()
  if (error) throw error
  return userFromRow(data)
}
