/** 日本時間の今日を YYYY-MM-DD で返す（期限比較と揃える） */
export function todayYmdInJst(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}
