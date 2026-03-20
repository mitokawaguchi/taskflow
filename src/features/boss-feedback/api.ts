import { getOwnerId, getSupabase, ensureCanDelete } from '@/api/helpers'
import type { BossFeedback, BossFeedbackCategory } from './types'

type BossFeedbackRow = {
  id: string
  created_at: string
  category: string
  description: string
  example_before: string | null
  example_after: string | null
  project_name: string | null
  frequency: number
  memo: string | null
}

function rowToBossFeedback(row: BossFeedbackRow): BossFeedback {
  return {
    id: row.id,
    createdAt: row.created_at,
    category: row.category as BossFeedbackCategory,
    description: row.description,
    exampleBefore: row.example_before,
    exampleAfter: row.example_after,
    projectName: row.project_name,
    frequency: row.frequency,
    memo: row.memo,
  }
}

/** 自分の指摘一覧（frequency 降順は UI 側でも可能だが、初期取得は DB ソート） */
export async function fetchBossFeedback(): Promise<BossFeedback[]> {
  const ownerId = await getOwnerId()
  if (!ownerId) return []
  const db = getSupabase()
  const { data, error } = await db
    .from('boss_feedback')
    .select('*')
    .eq('owner_id', ownerId)
    .order('frequency', { ascending: false })
  if (error) throw error
  const rows = (data ?? []) as BossFeedbackRow[]
  return rows.map(rowToBossFeedback)
}

export type BossFeedbackInsertInput = {
  id: string
  category: BossFeedbackCategory
  description: string
  exampleBefore: string | null
  exampleAfter: string | null
  projectName: string | null
  frequency: number
  memo: string | null
}

export async function insertBossFeedback(input: BossFeedbackInsertInput): Promise<BossFeedback> {
  const ownerId = await getOwnerId()
  if (!ownerId) throw new Error('ログインが必要です')
  const db = getSupabase()
  const row = {
    id: input.id,
    owner_id: ownerId,
    category: input.category,
    description: input.description,
    example_before: input.exampleBefore,
    example_after: input.exampleAfter,
    project_name: input.projectName,
    frequency: input.frequency,
    memo: input.memo,
  }
  const { data, error } = await db.from('boss_feedback').insert(row).select().single()
  if (error) throw error
  return rowToBossFeedback(data as BossFeedbackRow)
}

export type BossFeedbackUpdateInput = Omit<BossFeedbackInsertInput, 'id'>

export async function updateBossFeedback(
  id: string,
  input: BossFeedbackUpdateInput
): Promise<BossFeedback> {
  const db = getSupabase()
  const row = {
    category: input.category,
    description: input.description,
    example_before: input.exampleBefore,
    example_after: input.exampleAfter,
    project_name: input.projectName,
    frequency: input.frequency,
    memo: input.memo,
  }
  const { data, error } = await db.from('boss_feedback').update(row).eq('id', id).select().single()
  if (error) throw error
  return rowToBossFeedback(data as BossFeedbackRow)
}

export async function deleteBossFeedback(id: string): Promise<void> {
  await ensureCanDelete('boss_feedback', id)
  const db = getSupabase()
  const { error } = await db.from('boss_feedback').delete().eq('id', id)
  if (error) throw error
}
