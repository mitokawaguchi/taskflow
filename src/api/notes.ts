import { VALIDATION } from '../constants'
import type { Note } from '../types'
import { getSupabase, getOwnerId, ensureCanDelete } from './helpers'

interface NoteRow {
  id: string
  title: string | null
  snapshot: unknown | null
  updated_at: string
  created_at: string
}

function noteFromRow(row: NoteRow | null): Note | null {
  if (!row) return null
  return {
    id: row.id,
    title: row.title ?? '',
    snapshot: row.snapshot ?? null,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  }
}

export async function fetchNotes(): Promise<Note[]> {
  const db = getSupabase()
  const ownerId = await getOwnerId()
  let q = db.from('tf_notes').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.order('updated_at', { ascending: false })
  if (error) throw error
  const rows = (data ?? []) as NoteRow[]
  return rows.map((row) => noteFromRow(row)).filter((n): n is Note => n != null)
}

export async function fetchNote(id: string): Promise<Note | null> {
  const db = getSupabase()
  const ownerId = await getOwnerId()
  let q = db.from('tf_notes').select('*').eq('id', id)
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.maybeSingle()
  if (error) throw error
  return noteFromRow((data as NoteRow | null) ?? null)
}

export type NoteInsertInput = Pick<Note, 'id' | 'title'> & { snapshot?: unknown | null }

export async function insertNote(item: NoteInsertInput): Promise<Note> {
  const db = getSupabase()
  if (item.title != null && String(item.title).length > VALIDATION.noteTitle) {
    throw new Error(`タイトルは${VALIDATION.noteTitle}文字以内にしてください`)
  }
  const ownerId = await getOwnerId()
  const row: Record<string, unknown> = {
    id: item.id,
    title: item.title ?? '無題のメモ',
    snapshot: item.snapshot ?? null,
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await db.from('tf_notes').insert(row).select().single()
  if (error) throw error
  const result = noteFromRow(data as NoteRow)
  if (!result) throw new Error('insertNote: no data returned')
  return result
}

export type NoteUpdatePatch = Partial<Pick<Note, 'title' | 'snapshot'>>

export async function updateNote(id: string, patch: NoteUpdatePatch): Promise<Note> {
  const db = getSupabase()
  if (patch.title !== undefined && String(patch.title).length > VALIDATION.noteTitle) {
    throw new Error(`タイトルは${VALIDATION.noteTitle}文字以内にしてください`)
  }
  const row: Record<string, unknown> = {}
  if (patch.title !== undefined) row.title = patch.title
  if (patch.snapshot !== undefined) row.snapshot = patch.snapshot
  row.updated_at = new Date().toISOString()
  const { data, error } = await db.from('tf_notes').update(row).eq('id', id).select().single()
  if (error) throw error
  const result = noteFromRow(data as NoteRow)
  if (!result) throw new Error('updateNote: no data returned')
  return result
}

export async function deleteNote(id: string): Promise<void> {
  const db = getSupabase()
  await ensureCanDelete('tf_notes', id)
  const { error } = await db.from('tf_notes').delete().eq('id', id)
  if (error) throw error
}
