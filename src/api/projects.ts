import { VALIDATION } from '../constants'
import { getSupabase, getOwnerId, projectFromRow } from './helpers'
import type { Project } from '../types'

type ProjectRow = Parameters<typeof projectFromRow>[0]

export async function fetchProjects(): Promise<Project[]> {
  const db = getSupabase()
  const ownerId = await getOwnerId()
  let q = db.from('tf_projects').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  const { data, error } = await q.order('sort_order').order('id')
  if (error) throw error
  const rows = (data ?? []) as Array<Record<string, unknown>>
  return rows.map((row) => projectFromRow((row as unknown) as ProjectRow)).filter((p): p is Project => p != null)
}

export async function insertProject(
  project: Pick<Project, 'id' | 'name' | 'color' | 'icon'> & Partial<Pick<Project, 'endDate' | 'sortOrder'>>
): Promise<Project> {
  const db = getSupabase()
  if (!project?.name || String(project.name).length > VALIDATION.projectName) {
    throw new Error(`プロジェクト名は1〜${VALIDATION.projectName}文字にしてください`)
  }
  const ownerId = await getOwnerId()
  const row: Record<string, unknown> = {
    id: project.id,
    name: project.name,
    color: project.color,
    icon: project.icon,
    end_date: project.endDate || null,
    sort_order: project.sortOrder ?? 0,
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await db.from('tf_projects').insert(row).select().single()
  if (error) throw error
  const result = projectFromRow((data as unknown) as ProjectRow)
  if (!result) throw new Error('insertProject: no data returned')
  return result
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<Project, 'name' | 'color' | 'icon' | 'endDate' | 'sortOrder'>>
): Promise<Project> {
  const db = getSupabase()
  if (patch.name !== undefined && String(patch.name).length > VALIDATION.projectName) {
    throw new Error(`プロジェクト名は${VALIDATION.projectName}文字以内にしてください`)
  }
  const row: Record<string, unknown> = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.color !== undefined) row.color = patch.color
  if (patch.icon !== undefined) row.icon = patch.icon
  if (patch.endDate !== undefined) row.end_date = patch.endDate || null
  if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder
  const { data, error } = await db.from('tf_projects').update(row).eq('id', id).select().single()
  if (error) throw error
  const result = projectFromRow((data as unknown) as ProjectRow)
  if (!result) throw new Error('updateProject: no data returned')
  return result
}
