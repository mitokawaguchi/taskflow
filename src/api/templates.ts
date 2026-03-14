import { supabase } from '../supabase'
import { VALIDATION } from '../constants'
import { requireSupabase, getOwnerId, ensureCanDelete, templateFromRow } from './helpers'
import type { Template } from '../types'

export async function fetchTemplates(): Promise<Template[]> {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_templates').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.order('id')
  if (error) throw error
  const rows = (data ?? []) as Array<Record<string, unknown>>
  return rows.map((row) => templateFromRow(row as Parameters<typeof templateFromRow>[0])).filter((t): t is Template => t != null)
}

export type TemplateInsertInput = Pick<Template, 'id' | 'title'> & Partial<Pick<Template, 'desc' | 'priority'>>

export async function insertTemplate(template: TemplateInsertInput): Promise<Template> {
  requireSupabase()
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
  const { data, error } = await supabase.from('tf_templates').insert(row).select().single()
  if (error) throw error
  const result = templateFromRow(data as Parameters<typeof templateFromRow>[0])
  if (!result) throw new Error('insertTemplate: no data returned')
  return result
}

export type TemplateUpdatePatch = Partial<Pick<Template, 'title' | 'desc' | 'priority'>>

export async function updateTemplate(id: string, patch: TemplateUpdatePatch): Promise<Template> {
  requireSupabase()
  if (patch.title !== undefined && String(patch.title).length > VALIDATION.templateTitle) throw new Error(`テンプレート名は${VALIDATION.templateTitle}文字以内にしてください`)
  if (patch.desc !== undefined && String(patch.desc).length > VALIDATION.templateDesc) throw new Error(`説明は${VALIDATION.templateDesc}文字以内にしてください`)
  const row: Record<string, unknown> = {
    title: patch.title,
    desc: patch.desc ?? '',
    priority: patch.priority ?? 'medium',
  }
  const { data, error } = await supabase.from('tf_templates').update(row).eq('id', id).select().single()
  if (error) throw error
  const result = templateFromRow(data as Parameters<typeof templateFromRow>[0])
  if (!result) throw new Error('updateTemplate: no data returned')
  return result
}

export async function deleteTemplate(id: string): Promise<void> {
  requireSupabase()
  await ensureCanDelete('tf_templates', id)
  const { error } = await supabase.from('tf_templates').delete().eq('id', id)
  if (error) throw error
}
