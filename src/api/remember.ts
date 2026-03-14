import { supabase } from '../supabase'
import { VALIDATION } from '../constants'
import { requireSupabase, getOwnerId, ensureCanDelete, rememberFromRow } from './helpers'
import type { Remember } from '../types'

export async function fetchRemember(): Promise<Remember[]> {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_remember').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.order('created', { ascending: false })
  if (error) throw error
  const rows = (data ?? []) as Array<Record<string, unknown>>
  return rows.map((row) => rememberFromRow(row as Parameters<typeof rememberFromRow>[0])).filter((r): r is Remember => r != null)
}

export type RememberInsertInput = Pick<Remember, 'id' | 'clientId' | 'body'> & Partial<Pick<Remember, 'created'>>

export async function insertRemember(item: RememberInsertInput): Promise<Remember> {
  requireSupabase()
  if (item.body != null && String(item.body).length > VALIDATION.rememberBody) throw new Error(`メモは${VALIDATION.rememberBody}文字以内にしてください`)
  const ownerId = await getOwnerId()
  const row: Record<string, unknown> = {
    id: item.id,
    client_id: item.clientId,
    body: item.body,
    created: item.created,
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_remember').insert(row).select().single()
  if (error) throw error
  const result = rememberFromRow(data as Parameters<typeof rememberFromRow>[0])
  if (!result) throw new Error('insertRemember: no data returned')
  return result
}

/** @deprecated SEC-002: 本番では呼ばないこと。 */
export async function claimExistingDataToAccount(): Promise<never> {
  throw new Error(
    'claimExistingDataToAccount() は廃止されています (SEC-002)。RLS を有効にし、所有権移譲は招待・トークン方式で実装してください。'
  )
}

export type RememberUpdatePatch = Partial<Pick<Remember, 'body'>>

export async function updateRemember(id: string, patch: RememberUpdatePatch): Promise<Remember> {
  requireSupabase()
  if (patch.body !== undefined && String(patch.body).length > VALIDATION.rememberBody) throw new Error(`メモは${VALIDATION.rememberBody}文字以内にしてください`)
  const row: Record<string, unknown> = {}
  if (patch.body !== undefined) row.body = patch.body
  const { data, error } = await supabase.from('tf_remember').update(row).eq('id', id).select().single()
  if (error) throw error
  const result = rememberFromRow(data as Parameters<typeof rememberFromRow>[0])
  if (!result) throw new Error('updateRemember: no data returned')
  return result
}

export async function deleteRemember(id: string): Promise<void> {
  requireSupabase()
  await ensureCanDelete('tf_remember', id)
  const { error } = await supabase.from('tf_remember').delete().eq('id', id)
  if (error) throw error
}
