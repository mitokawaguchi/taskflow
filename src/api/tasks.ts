import { TASK_STATUS_KEYS, VALIDATION } from '../constants'
import { getSupabase, getOwnerId, normalizeDate, taskFromRow } from './helpers'
import type { PremortemRiskItem, Task } from '../types'

/** assignee_id が tf_users に存在するか確認。存在しなければ null を返す（FK 制約違反を防ぐ） */
async function resolveAssigneeId(assigneeId: string | null | undefined): Promise<string | null> {
  if (!assigneeId || !String(assigneeId).trim()) return null
  const db = getSupabase()
  const { data } = await db.from('tf_users').select('id').eq('id', assigneeId.trim()).maybeSingle()
  return data?.id ?? null
}

type TaskRow = Parameters<typeof taskFromRow>[0]

function normalizePremortemForDb(items: PremortemRiskItem[] | undefined): unknown {
  if (!items || !Array.isArray(items) || items.length === 0) return []
  return items
    .map((x) => (x && typeof x.text === 'string' ? { text: x.text.slice(0, VALIDATION.premortemLine) } : null))
    .filter((x): x is { text: string } => x != null && x.text.trim().length > 0)
}

export interface FetchTasksOpts {
  limit?: number
}

/** PERF-001: limit 指定で大量取得を抑制（デフォルト 500）。 */
export async function fetchTasks(opts: FetchTasksOpts = {}): Promise<Task[]> {
  const { limit = 500 } = opts
  const db = getSupabase()
  const ownerId = await getOwnerId()
  let q = db.from('tf_tasks').select('*')
  if (ownerId) q = q.eq('owner_id', ownerId)
  q = q.order('created', { ascending: false }).limit(Math.min(Math.max(1, limit), 2000))
  const { data, error } = await q
  if (error) throw error
  const rows = (data ?? []) as Array<Record<string, unknown>>
  return rows.map((row) => taskFromRow((row as unknown) as TaskRow)).filter((t): t is Task => t != null)
}

export type TaskInsertInput = Pick<Task, 'id' | 'title'> & Partial<Omit<Task, 'id' | 'title'>>

export async function insertTask(task: TaskInsertInput): Promise<Task> {
  const db = getSupabase()
  if (!task || typeof task.title !== 'string') throw new Error('タスク名は必須です')
  if (!task.purpose || !String(task.purpose).trim()) throw new Error('目的は必須です')
  if (task.title.length > VALIDATION.taskTitle) throw new Error(`タスク名は${VALIDATION.taskTitle}文字以内にしてください`)
  if (String(task.purpose).length > VALIDATION.taskPurpose) throw new Error(`目的は${VALIDATION.taskPurpose}文字以内にしてください`)
  if (task.desc != null && String(task.desc).length > VALIDATION.taskDesc) throw new Error(`説明は${VALIDATION.taskDesc}文字以内にしてください`)
  if (task.hypothesis != null && String(task.hypothesis).length > VALIDATION.taskHypothesis) {
    throw new Error(`予想メモは${VALIDATION.taskHypothesis}文字以内にしてください`)
  }
  const ownerId = await getOwnerId()
  const status = task.status && TASK_STATUS_KEYS.includes(task.status) ? task.status : (task.done ? 'done' : 'todo')
  const rawAssigneeId = task.assigneeId && String(task.assigneeId).trim() ? task.assigneeId : null
  const tb = task.timeboxMinutes
  const prem = normalizePremortemForDb(task.premortemRisks)
  const row: Record<string, unknown> = {
    id: task.id,
    project_id: task.projectId ?? null,
    title: task.title,
    desc: task.desc ?? '',
    purpose: task.purpose,
    priority: task.priority ?? 'medium',
    due: normalizeDate(task.due),
    done: status === 'done',
    status,
    start_date: normalizeDate(task.startDate),
    progress: task.progress != null && task.progress >= 0 && task.progress <= 100 ? task.progress : null,
    category: task.category || null,
    assignee_id: await resolveAssigneeId(rawAssigneeId),
    created: task.created,
    hypothesis: task.hypothesis != null && String(task.hypothesis).trim() ? String(task.hypothesis).trim() : null,
    timebox_minutes: tb != null && Number.isFinite(tb) && tb > 0 ? Math.min(24 * 60, Math.floor(tb)) : null,
    premortem_risks: prem,
    next_task_id: task.nextTaskId ?? null,
    completed_at: task.completedAt ?? null,
    timer_started_at: task.timerStartedAt ?? null,
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await db.from('tf_tasks').insert(row).select().single()
  if (error) throw error
  const result = taskFromRow((data as unknown) as TaskRow)
  if (!result) throw new Error('insertTask: no data returned')
  return result
}

export type TaskUpdatePatch = Partial<
  Pick<
    Task,
    | 'title'
    | 'desc'
    | 'purpose'
    | 'priority'
    | 'projectId'
    | 'due'
    | 'done'
    | 'status'
    | 'startDate'
    | 'progress'
    | 'category'
    | 'assigneeId'
    | 'hypothesis'
    | 'timeboxMinutes'
    | 'premortemRisks'
    | 'nextTaskId'
    | 'completedAt'
    | 'timerStartedAt'
  >
>

export async function updateTask(id: string, patch: TaskUpdatePatch): Promise<Task> {
  const db = getSupabase()
  if (!id || !patch || typeof patch !== 'object') throw new Error('更新パラメータが不正です')
  if (patch.title !== undefined && patch.title.length > VALIDATION.taskTitle) throw new Error(`タスク名は${VALIDATION.taskTitle}文字以内にしてください`)
  if (patch.purpose !== undefined && !String(patch.purpose).trim()) throw new Error('目的は必須です')
  if (patch.purpose !== undefined && String(patch.purpose).length > VALIDATION.taskPurpose) throw new Error(`目的は${VALIDATION.taskPurpose}文字以内にしてください`)
  if (patch.desc !== undefined && String(patch.desc).length > VALIDATION.taskDesc) throw new Error(`説明は${VALIDATION.taskDesc}文字以内にしてください`)
  if (patch.hypothesis !== undefined && patch.hypothesis != null && String(patch.hypothesis).length > VALIDATION.taskHypothesis) {
    throw new Error(`予想メモは${VALIDATION.taskHypothesis}文字以内にしてください`)
  }
  const row: Record<string, unknown> = {}
  if (patch.title !== undefined) row.title = patch.title
  if (patch.desc !== undefined) row.desc = patch.desc
  if (patch.purpose !== undefined) row.purpose = patch.purpose
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
  if (patch.progress !== undefined) {
    const p = patch.progress
    row.progress = p != null && p >= 0 && p <= 100 ? p : null
  }
  if (patch.category !== undefined) row.category = patch.category || null
  if (patch.assigneeId !== undefined) row.assignee_id = await resolveAssigneeId(patch.assigneeId)
  if (patch.hypothesis !== undefined) {
    row.hypothesis = patch.hypothesis != null && String(patch.hypothesis).trim() ? String(patch.hypothesis).trim() : null
  }
  if (patch.timeboxMinutes !== undefined) {
    const m = patch.timeboxMinutes
    row.timebox_minutes = m != null && Number.isFinite(m) && m > 0 ? Math.min(24 * 60, Math.floor(m)) : null
  }
  if (patch.premortemRisks !== undefined) {
    row.premortem_risks = normalizePremortemForDb(patch.premortemRisks)
  }
  if (patch.nextTaskId !== undefined) row.next_task_id = patch.nextTaskId
  if (patch.timerStartedAt !== undefined) row.timer_started_at = patch.timerStartedAt

  const markingDone = patch.done === true || patch.status === 'done'
  const markingUndone = patch.done === false || (patch.status != null && patch.status !== 'done')
  if (markingDone) {
    row.completed_at = patch.completedAt ?? new Date().toISOString()
  } else if (markingUndone) {
    row.completed_at = null
  }

  const { data, error } = await db.from('tf_tasks').update(row).eq('id', id).select().single()
  if (error) throw error
  const result = taskFromRow((data as unknown) as TaskRow)
  if (!result) throw new Error('updateTask: no data returned')
  return result
}
