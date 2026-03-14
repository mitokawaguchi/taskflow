import { supabase } from '../supabase'
import { VALIDATION } from '../constants'
import { requireSupabase, getOwnerId, ensureCanDelete, clientFromRow } from './helpers'
import type { Client } from '../types'

export async function fetchClients(): Promise<Client[]> {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_clients').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.order('id')
  if (error) throw error
  const rows = (data ?? []) as Array<Record<string, unknown>>
  return rows.map((row) => clientFromRow(row as Parameters<typeof clientFromRow>[0])).filter((c): c is Client => c != null)
}

export type ClientInsertInput = Pick<Client, 'id' | 'name'> & Partial<Pick<Client, 'color' | 'icon'>>

export async function insertClient(client: ClientInsertInput): Promise<Client> {
  requireSupabase()
  if (!client?.name || String(client.name).length > VALIDATION.clientName) throw new Error(`クライアント名は1〜${VALIDATION.clientName}文字にしてください`)
  const ownerId = await getOwnerId()
  const row: Record<string, unknown> = {
    id: client.id,
    name: client.name,
    color: client.color ?? '#2d6b3f',
    icon: client.icon ?? '🤝',
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_clients').insert(row).select().single()
  if (error) throw error
  const result = clientFromRow(data as Parameters<typeof clientFromRow>[0])
  if (!result) throw new Error('insertClient: no data returned')
  return result
}

export type ClientUpdatePatch = Partial<Pick<Client, 'name' | 'color' | 'icon'>>

export async function updateClient(id: string, patch: ClientUpdatePatch): Promise<Client> {
  requireSupabase()
  if (patch.name !== undefined && String(patch.name).length > VALIDATION.clientName) throw new Error(`クライアント名は${VALIDATION.clientName}文字以内にしてください`)
  const row: Record<string, unknown> = {
    name: patch.name,
    color: patch.color,
    icon: patch.icon,
  }
  const { data, error } = await supabase.from('tf_clients').update(row).eq('id', id).select().single()
  if (error) throw error
  const result = clientFromRow(data as Parameters<typeof clientFromRow>[0])
  if (!result) throw new Error('updateClient: no data returned')
  return result
}

export async function deleteClient(id: string): Promise<void> {
  requireSupabase()
  await ensureCanDelete('tf_clients', id)
  const { error } = await supabase.from('tf_clients').delete().eq('id', id)
  if (error) throw error
}
