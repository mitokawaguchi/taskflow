/** Asia/Tokyo・午前3時未満は前日扱い（日付の切り替えは 03:00 JST 以降） */
const TOKYO = 'Asia/Tokyo'

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** 現在時刻を東京のカレンダー日付 YYYY-MM-DD と時（0–23）で取得 */
export function getTokyoYmdAndHour(now: Date): { ymd: string; hour: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TOKYO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  })
  const parts = fmt.formatToParts(now)
  const y = parts.find((p) => p.type === 'year')?.value
  const m = parts.find((p) => p.type === 'month')?.value
  const d = parts.find((p) => p.type === 'day')?.value
  const h = parts.find((p) => p.type === 'hour')?.value
  if (!y || !m || !d || h === undefined) {
    throw new Error('plannerDay: failed to format Tokyo date')
  }
  const hour = Number.parseInt(h, 10)
  return { ymd: `${y}-${m}-${d}`, hour: Number.isFinite(hour) ? hour : 0 }
}

function addCalendarDaysYmd(ymd: string, delta: number): string {
  const [y, mo, da] = ymd.split('-').map((x) => Number.parseInt(x, 10))
  const dt = new Date(Date.UTC(y, mo - 1, da + delta))
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`
}

/** プランの「今日」に相当する暦日（JST・3時未満は前日） */
export function getEffectivePlannerYmd(now: Date = new Date()): string {
  const { ymd, hour } = getTokyoYmdAndHour(now)
  if (hour >= 3) return ymd
  return addCalendarDaysYmd(ymd, -1)
}
