import { supabase } from '../supabase'
import { VALIDATION } from '../constants'
import { requireSupabase, getOwnerId, projectFromRow } from './helpers'

export async function fetchProjects() {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_projects').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.order('sort_order').order('id')
  if (error) throw error
  return (data ?? []).map(projectFromRow)
}

export async function insertProject(project) {
  requireSupabase()
  if (!project?.name || String(project.name).length > VALIDATION.projectName) {
    throw new Error(`プロジェクト名は1〜${VALIDATION.projectName}文字にしてください`)
  }
  const ownerId = await getOwnerId()
  const row = {
    id: project.id,
    name: project.name,
    color: project.color,
    icon: project.icon,
    end_date: project.endDate || null,
    sort_order: project.sortOrder ?? 0,
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_projects').insert(row).select().single()
  if (error) throw error
  return projectFromRow(data)
}

export async function updateProject(id, patch) {
  requireSupabase()
  if (patch.name !== undefined && String(patch.name).length > VALIDATION.projectName) {
    throw new Error(`プロジェクト名は${VALIDATION.projectName}文字以内にしてください`)
  }
  const row = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.color !== undefined) row.color = patch.color
  if (patch.icon !== undefined) row.icon = patch.icon
  if (patch.endDate !== undefined) row.end_date = patch.endDate || null
  if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder
  const { data, error } = await supabase.from('tf_projects').update(row).eq('id', id).select().single()
  if (error) throw error
  return projectFromRow(data)
}
