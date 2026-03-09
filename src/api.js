import { supabase } from './supabase'

const CONFIG_MSG =
  'Supabase の設定がありません。.env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定するか、Vercel の環境変数を確認してください。'

function requireSupabase() {
  if (!supabase) throw new Error(CONFIG_MSG)
}

const TASK_STATUS_KEYS = ['todo', 'in_progress', 'review', 'done']

// DB の行 → アプリで使う形に変換
function taskFromRow(row) {
  if (!row) return null
  const status = TASK_STATUS_KEYS.includes(row.status) ? row.status : (row.done ? 'done' : 'todo')
  const progress = row.progress != null && row.progress >= 0 && row.progress <= 100 ? row.progress : null
  return {
    id: row.id,
    title: row.title,
    desc: row.desc ?? '',
    priority: row.priority ?? 'medium',
    projectId: row.project_id,
    due: row.due ?? '',
    done: status === 'done' || Boolean(row.done),
    status,
    startDate: row.start_date ?? '',
    progress,
    category: row.category ?? null,
    assigneeId: row.assignee_id ?? null,
    created: typeof row.created === 'number' ? row.created : Number(row.created) || 0,
  }
}

function projectFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    color: row.color ?? '#2d6b3f',
    icon: row.icon ?? '📁',
    endDate: row.end_date ?? '',
    sortOrder: row.sort_order ?? 0,
  }
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

function categoryFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name ?? '',
    color: row.color ?? '#6b7280',
  }
}

function userFromRow(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name ?? '',
    email: row.email ?? '',
    avatarUrl: row.avatar_url ?? '',
    created: typeof row.created === 'number' ? row.created : Number(row.created) || 0,
  }
}

/** ログイン中ユーザーID。owner_id の絞り込み・設定に使用 */
async function getOwnerId() {
  const session = await getAuthSession()
  return session?.user?.id ?? null
}

// ── 取得 ─────────────────────────────────────────────────────
export async function fetchProjects() {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_projects').select('*')
  if (ownerId) q = q.or(`owner_id.eq.${ownerId},owner_id.is.null`)
  const { data, error } = await q.order('sort_order').order('id')
  if (error) throw error
  return (data ?? []).map(projectFromRow)
}

export async function fetchTasks() {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_tasks').select('*')
  if (ownerId) q = q.or(`owner_id.eq.${ownerId},owner_id.is.null`)
  const { data, error } = await q.order('created', { ascending: false })
  if (error) throw error
  return (data ?? []).map(taskFromRow)
}

export async function fetchTemplates() {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_templates').select('*')
  if (ownerId) q = q.or(`owner_id.eq.${ownerId},owner_id.is.null`)
  const { data, error } = await q.order('id')
  if (error) throw error
  return (data ?? []).map(templateFromRow)
}

export async function fetchCategories() {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_categories').select('*')
  if (ownerId) q = q.or(`owner_id.eq.${ownerId},owner_id.is.null`)
  const { data, error } = await q.order('id')
  if (error) throw error
  return (data ?? []).map(categoryFromRow)
}

export async function fetchUsers() {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_users').select('*')
  if (ownerId) q = q.or(`owner_id.eq.${ownerId},owner_id.is.null`)
  const { data, error } = await q.order('created', { ascending: false })
  if (error) throw error
  return (data ?? []).map(userFromRow)
}

// ── プロジェクト追加・更新 ─────────────────────────────────────
export async function insertProject(project) {
  requireSupabase()
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

// ── タスク追加・更新 ─────────────────────────────────────────
export async function insertTask(task) {
  requireSupabase()
  const ownerId = await getOwnerId()
  const status = task.status && TASK_STATUS_KEYS.includes(task.status) ? task.status : (task.done ? 'done' : 'todo')
  const row = {
    id: task.id,
    project_id: task.projectId,
    title: task.title,
    desc: task.desc ?? '',
    priority: task.priority ?? 'medium',
    due: task.due || null,
    done: status === 'done',
    status,
    start_date: task.startDate || null,
    progress: task.progress != null && task.progress >= 0 && task.progress <= 100 ? task.progress : null,
    category: task.category || null,
    assignee_id: task.assigneeId || null,
    created: task.created,
  }
  if (ownerId) row.owner_id = ownerId
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
  if (patch.status !== undefined) {
    row.status = TASK_STATUS_KEYS.includes(patch.status) ? patch.status : (patch.done ? 'done' : 'todo')
    row.done = row.status === 'done'
  } else if (patch.done !== undefined) {
    row.status = patch.done ? 'done' : 'todo'
  }
  if (patch.startDate !== undefined) row.start_date = patch.startDate || null
  if (patch.progress !== undefined) row.progress = (patch.progress >= 0 && patch.progress <= 100) ? patch.progress : null
  if (patch.category !== undefined) row.category = patch.category || null
  if (patch.assigneeId !== undefined) row.assignee_id = patch.assigneeId || null
  const { data, error } = await supabase.from('tf_tasks').update(row).eq('id', id).select().single()
  if (error) throw error
  return taskFromRow(data)
}

// ── ユーザー（チームメンバー）追加・更新 ─────────────────────
export async function insertUser(user) {
  requireSupabase()
  const ownerId = await getOwnerId()
  const row = {
    id: user.id,
    name: user.name,
    email: user.email || null,
    avatar_url: user.avatarUrl || null,
    created: user.created,
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_users').insert(row).select().single()
  if (error) throw error
  return userFromRow(data)
}

export async function updateUser(id, patch) {
  requireSupabase()
  const row = {}
  if (patch.name !== undefined) row.name = patch.name
  if (patch.email !== undefined) row.email = patch.email || null
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl || null
  const { data, error } = await supabase.from('tf_users').update(row).eq('id', id).select().single()
  if (error) throw error
  return userFromRow(data)
}

// ── カテゴリ追加 ─────────────────────────────────────────────
export async function insertCategory(category) {
  requireSupabase()
  const ownerId = await getOwnerId()
  const row = {
    id: category.id,
    name: category.name,
    color: category.color ?? '#6b7280',
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_categories').insert(row).select().single()
  if (error) throw error
  return categoryFromRow(data)
}

// ── テンプレート追加 ─────────────────────────────────────────
export async function insertTemplate(template) {
  requireSupabase()
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

// ── クライアント（プロジェクトと別。取引先単位で覚えておくことを管理）────
export async function fetchClients() {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_clients').select('*')
  if (ownerId) q = q.or(`owner_id.eq.${ownerId},owner_id.is.null`)
  const { data, error } = await q.order('id')
  if (error) throw error
  return (data ?? []).map(clientFromRow)
}

export async function insertClient(client) {
  requireSupabase()
  const ownerId = await getOwnerId()
  const row = { id: client.id, name: client.name, color: client.color, icon: client.icon }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_clients').insert(row).select().single()
  if (error) throw error
  return clientFromRow(data)
}

// ── 覚えておくこと（クライアントごと）────────────────────────────
export async function fetchRemember() {
  requireSupabase()
  const ownerId = await getOwnerId()
  let q = supabase.from('tf_remember').select('*')
  if (ownerId) q = q.or(`owner_id.eq.${ownerId},owner_id.is.null`)
  const { data, error } = await q.order('created', { ascending: false })
  if (error) throw error
  return (data ?? []).map(rememberFromRow)
}

export async function insertRemember(item) {
  requireSupabase()
  const ownerId = await getOwnerId()
  const row = {
    id: item.id,
    client_id: item.clientId,
    body: item.body,
    created: item.created,
  }
  if (ownerId) row.owner_id = ownerId
  const { data, error } = await supabase.from('tf_remember').insert(row).select().single()
  if (error) throw error
  return rememberFromRow(data)
}

/** 既存データ（owner_id が NULL の行）を現在のアカウントに紐づける */
export async function claimExistingDataToAccount() {
  requireSupabase()
  const session = await getAuthSession()
  if (!session?.user?.id) throw new Error('ログインしてください')
  const uid = session.user.id
  const tables = ['tf_projects', 'tf_tasks', 'tf_templates', 'tf_categories', 'tf_users', 'tf_clients', 'tf_remember']
  for (const table of tables) {
    const { error } = await supabase.from(table).update({ owner_id: uid }).is('owner_id', null)
    if (error) throw error
  }
  return { ok: true }
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

// ── 認証（Supabase Auth）──────────────────────────────────────
export async function getAuthSession() {
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function signInWithPassword(email, password) {
  if (!supabase) throw new Error(CONFIG_MSG)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/** 新規アカウント作成。メール確認が有効な場合は session が null になり確認メールが送られる。
 * 確認メールのリンクは emailRedirectTo のURLへ飛ぶ。本番では Supabase の「サイトURL」も本番URLにすること。 */
export async function signUpWithEmail(email, password) {
  if (!supabase) throw new Error(CONFIG_MSG)
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined
  const { data, error } = await supabase.auth.signUp(
    { email, password },
    redirectTo ? { emailRedirectTo: redirectTo } : undefined
  )
  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

/** ログイン中のユーザーのパスワードを変更 */
export async function updateAuthPassword(newPassword) {
  if (!supabase) throw new Error(CONFIG_MSG)
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
  return data
}

/** ログイン中のユーザーのメタデータ（表示名など）を更新 */
export async function updateAuthUserMetadata(metadata) {
  if (!supabase) throw new Error(CONFIG_MSG)
  const { data, error } = await supabase.auth.updateUser({ data: metadata })
  if (error) throw error
  return data
}

/** 認証状態変更の購読。クリーンアップ用の unsubscribe を返す */
export function subscribeAuth(callback) {
  if (!supabase?.auth) return () => {}
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_ev, session) => callback(session))
  return () => subscription.unsubscribe()
}
