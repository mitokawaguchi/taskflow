export const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
export const save = (k, v) => localStorage.setItem(k, JSON.stringify(v))

/** ローカル日付の「今日」を YYYY-MM-DD で返す（タイムゾーンずれを防ぐ） */
export const today = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export const isToday = (d) => d && d === today()
export const isTomorrow = (d) => {
  if (!d) return false
  const t = new Date()
  t.setDate(t.getDate() + 1)
  const y = t.getFullYear()
  const m = String(t.getMonth() + 1).padStart(2, '0')
  const day = String(t.getDate()).padStart(2, '0')
  return d === `${y}-${m}-${day}`
}
export const isOverdue = (d) => d && d < today()

const WEEKDAY = ['日', '月', '火', '水', '木', '金', '土']

/** YYYY-MM-DD を「M/D(曜)」形式で返す */
export function formatDateWithWeekday(dateStr) {
  if (!dateStr) return ''
  const [y, m, day] = dateStr.split('-').map(Number)
  const d = new Date(y, m - 1, day)
  const w = WEEKDAY[d.getDay()]
  return `${m}/${day}(${w})`
}

export function formatDate(d) {
  if (!d) return ''
  const diff = Math.round((new Date(d) - new Date(today())) / 86400000)
  if (diff === 0) return '今日'
  if (diff === 1) return '明日'
  return formatDateWithWeekday(d)
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

/** プロジェクト終了日を日付・曜日で表示する */
export function endDateLabel(endDate) {
  if (!endDate) return ''
  const diff = Math.round((new Date(endDate) - new Date(today())) / 86400000)
  if (diff === 0) return '今日まで'
  return formatDateWithWeekday(endDate)
}
