import { supabase } from '../supabase'
import { VALIDATION } from '../constants'
import { requireSupabase, getOwnerId, ensureCanDelete, rememberFromRow } from './helpers'

export async function fetchRemember() {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_remember').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.order('created', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rememberFromRow)
}

export async function insertRemember(item) {
  requireSupabase()
  if (item.body != null && String(item.body).length > VALIDATION.rememberBody) throw new Error(`メモは${VALIDATION.rememberBody}文字以内にしてください`)
  const ownerId = await getOwnerId()
  const row = {
    id: item.id,
    client_id: item.clientId,
    body: item.body,
    created: item.created,
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_remember').insert(row).select().single()
  if (error) throw error
  return rememberFromRow(data)
}

/** @deprecated SEC-002: 本番では呼ばないこと。 */
export async function claimExistingDataToAccount() {
  throw new Error(
    'claimExistingDataToAccount() は廃止されています (SEC-002)。RLS を有効にし、所有権移譲は招待・トークン方式で実装してください。'
  )
}

export async function updateRemember(id, patch) {
  requireSupabase()
  if (patch.body !== undefined && String(patch.body).length > VALIDATION.rememberBody) throw new Error(`メモは${VALIDATION.rememberBody}文字以内にしてください`)
  const row = {}
  if (patch.body !== undefined) row.body = patch.body
  const { data, error } = await supabase.from('tf_remember').update(row).eq('id', id).select().single()
  if (error) throw error
  return rememberFromRow(data)
}

export async function deleteRemember(id) {
  requireSupabase()
  await ensureCanDelete('tf_remember', id)
  const { error } = await supabase.from('tf_remember').delete().eq('id', id)
  if (error) throw error
}
