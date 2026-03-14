import { supabase } from '../supabase'
import { requireSupabase, getOwnerId, userFromRow } from './helpers'
import type { User } from '../types'

export async function fetchUsers(): Promise<User[]> {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_users').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.order('created', { ascending: false })
  if (error) throw error
  const rows = (data ?? []) as Array<Record<string, unknown>>
  return rows.map((row) => userFromRow(row as Parameters<typeof userFromRow>[0])).filter((u): u is User => u != null)
}

export type UserInsertInput = Pick<User, 'id' | 'name'> & Partial<Pick<User, 'email' | 'avatarUrl' | 'created'>>

export async function insertUser(user: UserInsertInput): Promise<User> {
  requireSupabase()
  const ownerId = await getOwnerId()
  const row: Record<string, unknown> = {
    id: user.id,
    name: user.name,
    email: user.email || null,
    avatar_url: user.avatarUrl || null,
    created: user.created,
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_users').insert(row).select().single()
  if (error) throw error
  const result = userFromRow(data as Parameters<typeof userFromRow>[0])
  if (!result) throw new Error('insertUser: no data returned')
  return result
}

export type UserUpdatePatch = Partial<Pick<User, 'name' | 'email' | 'avatarUrl'>>

export async function updateUser(id: string, patch: UserUpdatePatch): Promise<User> {
  requireSupabase()
  const row: Record<string, unknown> = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.email !== undefined) row.email = patch.email || null
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl || null
  const { data, error } = await supabase.from('tf_users').update(row).eq('id', id).select().single()
  if (error) throw error
  const result = userFromRow(data as Parameters<typeof userFromRow>[0])
  if (!result) throw new Error('updateUser: no data returned')
  return result
}
