import { supabase } from '../supabase'
import { VALIDATION } from '../constants'
import { requireSupabase, getOwnerId, ensureCanDelete, templateFromRow } from './helpers'

export async function fetchTemplates() {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_templates').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.order('id')
  if (error) throw error
  return (data ?? []).map(templateFromRow)
}

export async function insertTemplate(template) {
  requireSupabase()
  if (template.title != null && String(template.title).length > VALIDATION.templateTitle) throw new Error(`テンプレート名は${VALIDATION.templateTitle}文字以内にしてください`)
  if (template.desc != null && String(template.desc).length > VALIDATION.templateDesc) throw new Error(`説明は${VALIDATION.templateDesc}文字以内にしてください`)
  const ownerId = await getOwnerId()
  const row = {
    id: template.id,
    title: template.title,
    desc: template.desc ?? '',
    priority: template.priority ?? 'medium',
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_templates').insert(row).select().single()
  if (error) throw error
  return templateFromRow(data)
}

export async function updateTemplate(id, patch) {
  requireSupabase()
  if (patch.title !== undefined && String(patch.title).length > VALIDATION.templateTitle) throw new Error(`テンプレート名は${VALIDATION.templateTitle}文字以内にしてください`)
  if (patch.desc !== undefined && String(patch.desc).length > VALIDATION.templateDesc) throw new Error(`説明は${VALIDATION.templateDesc}文字以内にしてください`)
  const row = {
    title: patch.title,
    desc: patch.desc ?? '',
    priority: patch.priority ?? 'medium',
  }
  const { data, error } = await supabase.from('tf_templates').update(row).eq('id', id).select().single()
  if (error) throw error
  return templateFromRow(data)
}

export async function deleteTemplate(id) {
  requireSupabase()
  await ensureCanDelete('tf_templates', id)
  const { error } = await supabase.from('tf_templates').delete().eq('id', id)
  if (error) throw error
}
