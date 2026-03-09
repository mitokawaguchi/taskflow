export const PRIORITY = {
  critical: { label: '緊急', color: '#ff4560' },
  high:     { label: '高',   color: '#ff8c42' },
  medium:   { label: '中',   color: '#ffd166' },
  low:      { label: '低',   color: '#06d6a0' },
}

/** カンバン用タスク状態 */
export const TASK_STATUS = {
  todo:        { key: 'todo',        label: '未着手' },
  in_progress: { key: 'in_progress', label: '進行中' },
  review:      { key: 'review',      label: 'レビュー中' },
  done:        { key: 'done',        label: '完了' },
}
export const TASK_STATUS_KEYS = ['todo', 'in_progress', 'review', 'done']

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

export const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
/** 重要度の範囲絞り込み用（緊急→低の順） */
export const PRIORITY_KEYS = ['critical', 'high', 'medium', 'low']

export const DEFAULT_PROJECTS = [
  { id: 'p1', name: '個人',          color: '#2d6b3f', icon: '👤' },
  { id: 'p2', name: 'T&D Holdings',  color: '#ff8c42', icon: '🏢' },
  { id: 'p3', name: 'クライアントA', color: '#06d6a0', icon: '🤝' },
]

export const DEFAULT_TASKS = [
  { id: 't1', title: 'アクティビスト投資家レポート作成', desc: 'EV品質ダッシュボードの最終確認', priority: 'critical', projectId: 'p2', due: new Date(Date.now()+86400000*1).toISOString().slice(0,10), done: false, created: Date.now()-100000 },
  { id: 't2', title: 'クライアントミーティング資料',     desc: '戦略提案スライドの更新',           priority: 'high',     projectId: 'p3', due: new Date(Date.now()+86400000*3).toISOString().slice(0,10), done: false, created: Date.now()-200000 },
  { id: 't3', title: 'NotebookLM設定確認',               desc: 'YAMLプレゼン設定のテスト',         priority: 'medium',   projectId: 'p1', due: new Date(Date.now()+86400000*5).toISOString().slice(0,10), done: false, created: Date.now()-300000 },
  { id: 't4', title: '週次レビュー準備',                  desc: '',                                 priority: 'low',      projectId: 'p2', due: new Date(Date.now()+86400000*7).toISOString().slice(0,10), done: true,  created: Date.now()-400000 },
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
