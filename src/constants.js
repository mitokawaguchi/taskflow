export const PRIORITY = {
  critical: { label: '緊急', color: '#ff4560' },
  high:     { label: '高',   color: '#ff8c42' },
  medium:   { label: '中',   color: '#ffd166' },
  low:      { label: '低',   color: '#06d6a0' },
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
