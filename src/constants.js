export const PRIORITY = {
  critical: { label: '緊急', color: '#ff4560' },
  high:     { label: '高',   color: '#ff8c42' },
  medium:   { label: '中',   color: '#ffd166' },
  low:      { label: '低',   color: '#06d6a0' },
}

/** DB 不正値対策: 重要度キーからラベルを取得（未定義時はキーそのまま） */
export function getPriorityLabel(priority) {
  return PRIORITY[priority]?.label ?? (priority && String(priority)) ?? '中'
}

/** DB 不正値対策: 重要度キーから色を取得（未定義時は medium 相当） */
export function getPriorityColor(priority) {
  return PRIORITY[priority]?.color ?? PRIORITY.medium.color
}

/** カンバン用タスク状態 */
export const TASK_STATUS = {
  todo:        { key: 'todo',        label: '未着手' },
  in_progress: { key: 'in_progress', label: '進行中' },
  review:      { key: 'review',      label: 'レビュー中' },
  done:        { key: 'done',        label: '完了' },
}
export const TASK_STATUS_KEYS = ['todo', 'in_progress', 'review', 'done']

/** SEC-004: 入力バリデーション用の最大文字数（DB・UX 保護） */
export const VALIDATION = {
  taskTitle: 500,
  taskDesc: 2000,
  projectName: 200,
  templateTitle: 200,
  templateDesc: 2000,
  clientName: 200,
  rememberBody: 2000,
  noteTitle: 200,
  /** メモ本文（プレーンテキスト） */
  noteBody: 50000,
}

/** 文字列を最大長で切り詰め（trim 済みを想定） */
export function truncateToMax(str, max) {
  if (typeof str !== 'string') return ''
  const t = str.trim()
  return t.length > max ? t.slice(0, max) : t
}

/** 状態から進捗率を算出（%）。未指定時用 */
export function progressFromStatus(status) {
  const map = { todo: 0, in_progress: 50, review: 80, done: 100 }
  return map[status] ?? 0
}

export const SORT_OPTIONS = [
  { key: 'priority', label: '重要度' },
  { key: 'due',      label: '期限' },
  { key: 'created',  label: '作成日' },
  { key: 'name',     label: '名前' },
]

/** TopBar タブ（カンバン / タイムライン / インサイト） */
export const VIEW_TABS = [
  { key: 'kanban', label: 'カンバン', icon: '📌' },
  { key: 'gantt', label: 'タイムライン', icon: '📅' },
  { key: 'dashboard', label: 'インサイト', icon: '📊' },
]

export const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
/** 重要度の範囲絞り込み用（緊急→低の順） */
export const PRIORITY_KEYS = ['critical', 'high', 'medium', 'low']

/** デモ・オフライン用のサンプルプロジェクト（実在企業名・取引先名は使用しない） */
export const DEFAULT_PROJECTS = [
  { id: 'p1', name: '個人', color: '#2d6b3f', icon: '👤' },
  { id: 'p2', name: 'サンプル企業A', color: '#ff8c42', icon: '🏢' },
  { id: 'p3', name: 'サンプルクライアント', color: '#06d6a0', icon: '🤝' },
]

/** デモ・オフライン用のサンプルタスク（業務内容の漏洩を防ぐためダミーのみ） */
export const DEFAULT_TASKS = [
  { id: 't1', title: 'サンプルタスク（緊急）', desc: '説明文の例', priority: 'critical', projectId: 'p2', due: new Date(Date.now()+86400000*1).toISOString().slice(0,10), done: false, created: Date.now()-100000 },
  { id: 't2', title: 'サンプルタスク（高）', desc: '説明文の例', priority: 'high', projectId: 'p3', due: new Date(Date.now()+86400000*3).toISOString().slice(0,10), done: false, created: Date.now()-200000 },
  { id: 't3', title: 'サンプルタスク（中）', desc: '説明文の例', priority: 'medium', projectId: 'p1', due: new Date(Date.now()+86400000*5).toISOString().slice(0,10), done: false, created: Date.now()-300000 },
  { id: 't4', title: '週次レビュー準備', desc: '', priority: 'low', projectId: 'p2', due: new Date(Date.now()+86400000*7).toISOString().slice(0,10), done: true, created: Date.now()-400000 },
]

/** タスクカテゴリ（DB未使用時のフォールバック） */
export const TASK_CATEGORIES = {
  design: { label: 'デザイン', color: '#3b82f6' },
  dev: { label: '開発', color: '#8b5cf6' },
  bug: { label: 'バグ修正', color: '#ef4444' },
  docs: { label: 'ドキュメント', color: '#06b6d4' },
  other: { label: 'その他', color: '#6b7280' },
  event: { label: 'イベント', color: '#ec4899' },
  routine: { label: '定例業務', color: '#14b8a6' },
}

export const CATEGORY_KEYS = ['design', 'dev', 'bug', 'docs', 'other', 'event', 'routine']

/** カテゴリ色選択用パレット（視覚選択UI用） */
export const CATEGORY_COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  '#f43f5e', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#c2410c', '#9a3412', '#78350f',
  '#713f12', '#654321', '#4d7c0f', '#365314', '#14532d', '#134e4a', '#0f766e', '#155e75',
  '#0e7490', '#1e40af', '#312e81', '#4c1d95', '#581c87', '#701a75', '#831843', '#9d174d',
  '#6b7280', '#4b5563', '#374151', '#1f2937', '#111827', '#78716c', '#57534e', '#44403c',
]

/** カテゴリを { id, label, color } の配列として扱う際のヘルパー */
export function categoriesToOptions(categories) {
  if (!categories || categories.length === 0) {
    return CATEGORY_KEYS.map((key) => ({ id: key, label: TASK_CATEGORIES[key].label, color: TASK_CATEGORIES[key].color }))
  }
  return categories.map((c) => ({ id: c.id, label: c.name, color: c.color ?? '#6b7280' }))
}

/** id からラベル・色を解決（categories または TASK_CATEGORIES を使用） */
export function getCategoryInfo(categoryId, categoriesFromApi) {
  if (categoriesFromApi?.length) {
    const found = categoriesFromApi.find((c) => c.id === categoryId)
    if (found) return { label: found.name, color: found.color ?? '#6b7280' }
  }
  return TASK_CATEGORIES[categoryId] ? { label: TASK_CATEGORIES[categoryId].label, color: TASK_CATEGORIES[categoryId].color } : null
}
