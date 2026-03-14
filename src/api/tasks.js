import { supabase } from '../supabase'
import { TASK_STATUS_KEYS, VALIDATION } from '../constants'
import { requireSupabase, getOwnerId, normalizeDate, taskFromRow } from './helpers'

/** PERF-001: limit 指定で大量取得を抑制（デフォルト 500）。 */
export async function fetchTasks(opts = {}) {
  const { limit = 500 } = opts
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_tasks').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  q = q.order('created', { ascending: false }).limit(Math.min(Math.max(1, limit), 2000))
  const { data, error } = await q
  if (error) throw error
  return (data ?? []).map(taskFromRow)
}

export async function insertTask(task) {
  requireSupabase()
  if (!task || typeof task.title !== 'string') throw new Error('タスク名は必須です')
  if (task.title.length > VALIDATION.taskTitle) throw new Error(`タスク名は${VALIDATION.taskTitle}文字以内にしてください`)
  if (task.desc != null && String(task.desc).length > VALIDATION.taskDesc) throw new Error(`説明は${VALIDATION.taskDesc}文字以内にしてください`)
  const ownerId = await getOwnerId()
  const status = task.status && TASK_STATUS_KEYS.includes(task.status) ? task.status : (task.done ? 'done' : 'todo')
  const row = {
    id: task.id,
    project_id: task.projectId ?? null,
    title: task.title,
    desc: task.desc ?? '',
    priority: task.priority ?? 'medium',
    due: normalizeDate(task.due),
    done: status === 'done',
    status,
    start_date: normalizeDate(task.startDate),
    progress: task.progress != null && task.progress >= 0 && task.progress <= 100 ? task.progress : null,
    category: task.category || null,
    assignee_id: task.assigneeId && String(task.assigneeId).trim() ? task.assigneeId : null,
    created: task.created,
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_tasks').insert(row).select().single()
  if (error) throw error
  return taskFromRow(data)
}

export async function updateTask(id, patch) {
  requireSupabase()
  if (!id || !patch || typeof patch !== 'object') throw new Error('更新パラメータが不正です')
  if (patch.title !== undefined && patch.title.length > VALIDATION.taskTitle) throw new Error(`タスク名は${VALIDATION.taskTitle}文字以内にしてください`)
  if (patch.desc !== undefined && String(patch.desc).length > VALIDATION.taskDesc) throw new Error(`説明は${VALIDATION.taskDesc}文字以内にしてください`)
  const row = {}
  if (patch.title !== undefined) row.title = patch.title
  if (patch.desc !== undefined) row.desc = patch.desc
  if (patch.priority !== undefined) row.priority = patch.priority
  if (patch.projectId !== undefined) row.project_id = patch.projectId
  if (patch.due !== undefined) row.due = normalizeDate(patch.due)
  if (patch.done !== undefined) row.done = patch.done
  if (patch.status !== undefined) {
    row.status = TASK_STATUS_KEYS.includes(patch.status) ? patch.status : (patch.done ? 'done' : 'todo')
    row.done = row.status === 'done'
  } else if (patch.done !== undefined) {
    row.status = patch.done ? 'done' : 'todo'
  }
  if (patch.startDate !== undefined) row.start_date = normalizeDate(patch.startDate)
  if (patch.progress !== undefined) row.progress = patch.progress >= 0 && patch.progress <= 100 ? patch.progress : null
  if (patch.category !== undefined) row.category = patch.category || null
  if (patch.assigneeId !== undefined) row.assignee_id = patch.assigneeId && String(patch.assigneeId).trim() ? patch.assigneeId : null
  const { data, error } = await supabase.from('tf_tasks').update(row).eq('id', id).select().single()
  if (error) throw error
  return taskFromRow(data)
}
