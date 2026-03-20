import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import type { TaskReminderInput } from './types.ts'

type Supabase = ReturnType<typeof createClient>

type TaskRow = {
  id: string
  title: string
  due: string | null
  done: boolean
  project_id: string | null
  owner_id: string | null
}

/** 未完了タスクと PJ 名を結合。owner 絞り込みはオプション（単一ユーザー運用向け） */
export async function loadTasksForReminders(
  supabase: Supabase,
  ownerIdFilter: string | null
): Promise<TaskReminderInput[]> {
  let q = supabase
    .from('tf_tasks')
    .select('id, title, due, done, project_id, owner_id')
    .eq('done', false)
  if (ownerIdFilter) q = q.eq('owner_id', ownerIdFilter)
  const { data: tasks, error: tErr } = await q
  if (tErr) throw tErr
  const { data: projects, error: pErr } = await supabase.from('tf_projects').select('id, name')
  if (pErr) throw pErr
  const projMap = new Map((projects ?? []).map((p: { id: string; name: string }) => [p.id, p.name]))
  const rows = (tasks ?? []) as TaskRow[]
  return rows.map((t) => ({
    id: t.id,
    title: t.title,
    due: t.due,
    done: t.done,
    projectName: t.project_id ? (projMap.get(t.project_id) ?? '') : '',
  }))
}
