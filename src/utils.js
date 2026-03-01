export const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
export const save = (k, v) => localStorage.setItem(k, JSON.stringify(v))

export const today    = () => new Date().toISOString().slice(0, 10)
export const isToday  = (d) => d === today()
export const isOverdue = (d) => d && d < today()

export function formatDate(d) {
  if (!d) return ''
  const diff = Math.round((new Date(d) - new Date(today())) / 86400000)
  if (diff < 0)  return `${Math.abs(diff)}日超過`
  if (diff === 0) return '今日'
  if (diff === 1) return '明日'
  return `${diff}日後`
}

/** 今日の日付を「2025年3月1日(日)」形式で返す（サイト名の下用） */
export function formatTodayDisplay() {
  const d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const week = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  return `${y}年${m}月${day}日(${week})`
}

/** プロジェクト終了日から「残りN日」等のラベルを返す */
export function endDateLabel(endDate) {
  if (!endDate) return ''
  const diff = Math.round((new Date(endDate) - new Date(today())) / 86400000)
  if (diff < 0) return `${Math.abs(diff)}日超過`
  if (diff === 0) return '今日まで'
  if (diff === 1) return '残り1日'
  return `残り${diff}日`
}
