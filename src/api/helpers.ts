import { supabase } from '../supabase'
import { TASK_STATUS_KEYS } from '../constants'
import type { Task, Project, Template, Client, Remember, Category, User } from '../types'

export const CONFIG_MSG =
  'Supabase の設定がありません。.env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定するか、Vercel の環境変数を確認してください。'

export function requireSupabase(): void {
  if (!supabase) throw new Error(CONFIG_MSG)
}

/** requireSupabase 後に呼び出し。null でない Supabase クライアントを返す（型安全） */
export function getSupabase(): NonNullable<typeof supabase> {
  requireSupabase()
  return supabase as NonNullable<typeof supabase>
}

/** 日付を DB 用に正規化: 空・無効は null、文字列はそのまま、Date は YYYY-MM-DD */
export function normalizeDate(v: string | Date | null | undefined): string | null {
  if (v == null || v === '') return null
  if (typeof v === 'string') {
    const s = v.trim()
    return s ? s : null
  }
  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    return v.toISOString().slice(0, 10)
  }
  return null
}

interface TaskRow {
  id: string
  title: string
  desc?: string | null
  purpose?: string | null
  priority?: string | null
  project_id?: string | null
  due?: string | null
  done?: boolean
  status?: string | null
  start_date?: string | null
  progress?: number | null
  category?: string | null
  assignee_id?: string | null
  created?: number | string
}

export function taskFromRow(row: TaskRow | null): Task | null {
  if (!row) return null
  const status = TASK_STATUS_KEYS.includes(row.status as Task['status']) ? row.status : (row.done ? 'done' : 'todo')
  const progress = row.progress != null && row.progress >= 0 && row.progress <= 100 ? row.progress : null
  return {
    id: row.id,
    title: row.title,
    desc: row.desc ?? '',
    purpose: row.purpose ?? '',
    priority: (row.priority as Task['priority']) ?? 'medium',
    projectId: row.project_id ?? null,
    due: row.due ?? '',
    done: status === 'done' || Boolean(row.done),
    status: status as Task['status'],
    startDate: row.start_date ?? '',
    progress,
    category: row.category ?? null,
    assigneeId: row.assignee_id ?? null,
    created: typeof row.created === 'number' ? row.created : Number(row.created) || 0,
  }
}

interface ProjectRow {
  id: string
  name: string
  purpose?: string | null
  color?: string | null
  icon?: string | null
  end_date?: string | null
  sort_order?: number | null
}

export function projectFromRow(row: ProjectRow | null): Project | null {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    purpose: row.purpose ?? '',
    color: row.color ?? '#2d6b3f',
    icon: row.icon ?? '📁',
    endDate: row.end_date ?? '',
    sortOrder: row.sort_order ?? 0,
  }
}

interface TemplateRow {
  id: string
  title: string
  desc?: string | null
  priority?: string | null
}

export function templateFromRow(row: TemplateRow | null): Template | null {
  if (!row) return null
  return { id: row.id, title: row.title, desc: row.desc ?? '', priority: (row.priority as Template['priority']) ?? 'medium' }
}

interface ClientRow {
  id: string
  name: string
  color?: string | null
  icon?: string | null
}

export function clientFromRow(row: ClientRow | null): Client | null {
  if (!row) return null
  return { id: row.id, name: row.name, color: row.color ?? '#2d6b3f', icon: row.icon ?? '🤝' }
}

interface RememberRow {
  id: string
  client_id: string
  body?: string | null
  created?: number | string
}

export function rememberFromRow(row: RememberRow | null): Remember | null {
  if (!row) return null
  return {
    id: row.id,
    clientId: row.client_id,
    body: row.body ?? '',
    created: typeof row.created === 'number' ? row.created : Number(row.created) || 0,
  }
}

interface CategoryRow {
  id: string
  name?: string | null
  color?: string | null
}

export function categoryFromRow(row: CategoryRow | null): Category | null {
  if (!row) return null
  return {
    id: row.id,
    name: row.name ?? '',
    color: row.color ?? '#6b7280',
  }
}

interface UserRow {
  id: string
  name?: string | null
  email?: string | null
  avatar_url?: string | null
  created?: number | string
}

export function userFromRow(row: UserRow | null): User | null {
  if (!row) return null
  return {
    id: row.id,
    name: row.name ?? '',
    email: row.email ?? '',
    avatarUrl: row.avatar_url ?? '',
    created: typeof row.created === 'number' ? row.created : Number(row.created) || 0,
  }
}

export async function getAuthSession(): Promise<{ user: { id: string } } | null> {
  if (!supabase) return null
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch {
    return null
  }
}

/** ログイン中ユーザーID。owner_id の絞り込み・設定に使用 */
export async function getOwnerId(): Promise<string | null> {
  const session = await getAuthSession()
  return session?.user?.id ?? null
}

/** SEC-005: 削除前に所有者を確認。RLS 未設定時も他人のデータを削除させない */
export async function ensureCanDelete(table: string, id: string): Promise<void> {
  const db = getSupabase()
  const ownerId = await getOwnerId()
  const { data: row, error } = await db.from(table).select('owner_id').eq('id', id).single()
  if (error || !row) throw new Error('削除対象が見つかりません')
  if ((row as { owner_id: string | null }).owner_id != null && ownerId !== (row as { owner_id: string }).owner_id) {
    throw new Error('このデータを削除する権限がありません')
  }
}
