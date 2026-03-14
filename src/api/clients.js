import { supabase } from '../supabase'
import { VALIDATION } from '../constants'
import { requireSupabase, getOwnerId, ensureCanDelete, clientFromRow } from './helpers'

export async function fetchClients() {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_clients').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.order('id')
  if (error) throw error
  return (data ?? []).map(clientFromRow)
}

export async function insertClient(client) {
  requireSupabase()
  if (!client?.name || String(client.name).length > VALIDATION.clientName) throw new Error(`クライアント名は1〜${VALIDATION.clientName}文字にしてください`)
  const ownerId = await getOwnerId()
  const row = { id: client.id, name: client.name, color: client.color, icon: client.icon }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_clients').insert(row).select().single()
  if (error) throw error
  return clientFromRow(data)
}

export async function updateClient(id, patch) {
  requireSupabase()
  if (patch.name !== undefined && String(patch.name).length > VALIDATION.clientName) throw new Error(`クライアント名は${VALIDATION.clientName}文字以内にしてください`)
  const row = { name: patch.name, color: patch.color, icon: patch.icon }
  const { data, error } = await supabase.from('tf_clients').update(row).eq('id', id).select().single()
  if (error) throw error
  return clientFromRow(data)
}

export async function deleteClient(id) {
  requireSupabase()
  await ensureCanDelete('tf_clients', id)
  const { error } = await supabase.from('tf_clients').delete().eq('id', id)
  if (error) throw error
}
