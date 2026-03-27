import type { Client, Project } from '../types'

type ViewTitleOpts = {
  projects: Project[]
  clients: Client[]
}

/** TopBar 用タイトル文字列 */
export function getViewTitle(view: string, opts: ViewTitleOpts): string {
  if (view === 'all') return 'すべてのタスク'
  if (view === 'today') return '今日のタスク'
  if (view === 'overdue') return '期限超過'
  if (view === 'kanban') return 'カンバン'
  if (view === 'dashboard') return 'ダッシュボード'
  if (view === 'gantt') return 'タイムライン'
  if (view === 'projects') return 'プロジェクト'
  if (view === 'templates') return 'テンプレート'
  if (view === 'clients') return '覚えておくこと'
  if (view === 'categories') return 'カテゴリ'
  if (view === 'boss-feedback') return '上司の指摘DB'
  if (view === 'mail-tracker') return '未返信'
  if (view.startsWith('c:')) return opts.clients.find((c) => c.id === view.slice(2))?.name ?? 'クライアント'
  if (view.startsWith('p:')) return opts.projects.find((p) => p.id === view.slice(2))?.name ?? ''
  return ''
}
