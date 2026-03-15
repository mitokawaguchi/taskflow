import { VALIDATION } from '../constants'
import { getSupabase, getOwnerId, ensureCanDelete, templateFromRow } from './helpers'
import type { Template } from '../types'

type TemplateRow = Parameters<typeof templateFromRow>[0]

export async function fetchTemplates(): Promise<Template[]> {
  const db = getSupabase()
  const ownerId = await getOwnerId()
  let q = db.from('tf_templates').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.order('id')
  if (error) throw error
  const rows = (data ?? []) as Array<Record<string, unknown>>
  return rows.map((row) => templateFromRow((row as unknown) as TemplateRow)).filter((t): t is Template => t != null)
}

export type TemplateInsertInput = Pick<Template, 'id' | 'title'> & Partial<Pick<Template, 'desc' | 'priority'>>

export async function insertTemplate(template: TemplateInsertInput): Promise<Template> {
  const db = getSupabase()
  if (template.title != null && String(template.title).length > VALIDATION.templateTitle) throw new Error(`テンプレート名は${VALIDATION.templateTitle}文字以内にしてください`)
  if (template.desc != null && String(template.desc).length > VALIDATION.templateDesc) throw new Error(`説明は${VALIDATION.templateDesc}文字以内にしてください`)
  const ownerId = await getOwnerId()
  const row: Record<string, unknown> = {
    id: template.id,
    title: template.title,
    desc: template.desc ?? '',
    priority: template.priority ?? 'medium',
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await db.from('tf_templates').insert(row).select().single()
  if (error) throw error
  const result = templateFromRow((data as unknown) as TemplateRow)
  if (!result) throw new Error('insertTemplate: no data returned')
  return result
}

export type TemplateUpdatePatch = Partial<Pick<Template, 'title' | 'desc' | 'priority'>>

export async function updateTemplate(id: string, patch: TemplateUpdatePatch): Promise<Template> {
  const db = getSupabase()
  if (patch.title !== undefined && String(patch.title).length > VALIDATION.templateTitle) throw new Error(`テンプレート名は${VALIDATION.templateTitle}文字以内にしてください`)
  if (patch.desc !== undefined && String(patch.desc).length > VALIDATION.templateDesc) throw new Error(`説明は${VALIDATION.templateDesc}文字以内にしてください`)
  const row: Record<string, unknown> = {
    title: patch.title,
    desc: patch.desc ?? '',
    priority: patch.priority ?? 'medium',
  }
  const { data, error } = await db.from('tf_templates').update(row).eq('id', id).select().single()
  if (error) throw error
  const result = templateFromRow((data as unknown) as TemplateRow)
  if (!result) throw new Error('updateTemplate: no data returned')
  return result
}

export async function deleteTemplate(id: string): Promise<void> {
  const db = getSupabase()
  await ensureCanDelete('tf_templates', id)
  const { error } = await db.from('tf_templates').delete().eq('id', id)
  if (error) throw error
}
