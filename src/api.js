import { supabase } from './supabase'

const CONFIG_MSG =
  'Supabase の設定がありません。.env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定するか、Vercel の環境変数を確認してください。'

function requireSupabase() {
  if (!supabase) throw new Error(CONFIG_MSG)
}

// DB の行 → アプリで使う形に変換
function taskFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    title: row.title,
    desc: row.desc ?? '',
    priority: row.priority ?? 'medium',
    projectId: row.project_id,
    due: row.due ?? '',
    done: Boolean(row.done),
    created: typeof row.created === 'number' ? row.created : Number(row.created) || 0,
  }
}

function projectFromRow(row) {
  if (!row) return null
  return { id: row.id, name: row.name, color: row.color ?? '#2d6b3f', icon: row.icon ?? '📁' }
}

function templateFromRow(row) {
  if (!row) return null
  return { id: row.id, title: row.title, desc: row.desc ?? '', priority: row.priority ?? 'medium' }
}

function clientFromRow(row) {
  if (!row) return null
  return { id: row.id, name: row.name, color: row.color ?? '#2d6b3f', icon: row.icon ?? '🤝' }
}

function rememberFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    clientId: row.client_id,
    body: row.body ?? '',
    created: typeof row.created === 'number' ? row.created : Number(row.created) || 0,
  }
}

// ── 取得 ─────────────────────────────────────────────────────
export async function fetchProjects() {
  requireSupabase()
  const { data, error } = await supabase.from('tf_projects').select('*').order('id')
  if (error) throw error
  return (data ?? []).map(projectFromRow)
}

export async function fetchTasks() {
  requireSupabase()
  const { data, error } = await supabase.from('tf_tasks').select('*').order('created', { ascending: false })
  if (error) throw error
  return (data ?? []).map(taskFromRow)
}

export async function fetchTemplates() {
  requireSupabase()
  const { data, error } = await supabase.from('tf_templates').select('*').order('id')
  if (error) throw error
  return (data ?? []).map(templateFromRow)
}

// ── プロジェクト追加 ─────────────────────────────────────────
export async function insertProject(project) {
  requireSupabase()
  const row = { id: project.id, name: project.name, color: project.color, icon: project.icon }
  const { data, error } = await supabase.from('tf_projects').insert(row).select().single()
  if (error) throw error
  return projectFromRow(data)
}

// ── タスク追加・更新 ─────────────────────────────────────────
export async function insertTask(task) {
  requireSupabase()
  const row = {
    id: task.id,
    project_id: task.projectId,
    title: task.title,
    desc: task.desc ?? '',
    priority: task.priority ?? 'medium',
    due: task.due || null,
    done: Boolean(task.done),
    created: task.created,
  }
  const { data, error } = await supabase.from('tf_tasks').insert(row).select().single()
  if (error) throw error
  return taskFromRow(data)
}

export async function updateTask(id, patch) {
  requireSupabase()
  const row = {}
  if (patch.title !== undefined) row.title = patch.title
  if (patch.desc !== undefined) row.desc = patch.desc
  if (patch.priority !== undefined) row.priority = patch.priority
  if (patch.projectId !== undefined) row.project_id = patch.projectId
  if (patch.due !== undefined) row.due = patch.due || null
  if (patch.done !== undefined) row.done = patch.done
  const { data, error } = await supabase.from('tf_tasks').update(row).eq('id', id).select().single()
  if (error) throw error
  return taskFromRow(data)
}

// ── テンプレート追加 ─────────────────────────────────────────
export async function insertTemplate(template) {
  requireSupabase()
  const row = {
    id: template.id,
    title: template.title,
    desc: template.desc ?? '',
    priority: template.priority ?? 'medium',
  }
  const { data, error } = await supabase.from('tf_templates').insert(row).select().single()
  if (error) throw error
  return templateFromRow(data)
}

// ── クライアント（プロジェクトと別。取引先単位で覚えておくことを管理）────
export async function fetchClients() {
  requireSupabase()
  const { data, error } = await supabase.from('tf_clients').select('*').order('id')
  if (error) throw error
  return (data ?? []).map(clientFromRow)
}

export async function insertClient(client) {
  requireSupabase()
  const row = { id: client.id, name: client.name, color: client.color, icon: client.icon }
  const { data, error } = await supabase.from('tf_clients').insert(row).select().single()
  if (error) throw error
  return clientFromRow(data)
}

// ── 覚えておくこと（クライアントごと）────────────────────────────
export async function fetchRemember() {
  requireSupabase()
  const { data, error } = await supabase.from('tf_remember').select('*').order('created', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rememberFromRow)
}

export async function insertRemember(item) {
  requireSupabase()
  const row = {
    id: item.id,
    client_id: item.clientId,
    body: item.body,
    created: item.created,
  }
  const { data, error } = await supabase.from('tf_remember').insert(row).select().single()
  if (error) throw error
  return rememberFromRow(data)
}

export async function updateRemember(id, patch) {
  requireSupabase()
  const row = {}
  if (patch.body !== undefined) row.body = patch.body
  const { data, error } = await supabase.from('tf_remember').update(row).eq('id', id).select().single()
  if (error) throw error
  return rememberFromRow(data)
}

export async function deleteRemember(id) {
  requireSupabase()
  const { error } = await supabase.from('tf_remember').delete().eq('id', id)
  if (error) throw error
}
