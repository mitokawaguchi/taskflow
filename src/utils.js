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
