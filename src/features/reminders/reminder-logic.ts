import type { ReminderBucket, TaskReminderInput } from './types'

/** 今日と期限（YYYY-MM-DD）の差分日数（期限が未来なら正） */
export function daysUntilDue(todayYmd: string, dueYmd: string): number {
  const t = new Date(`${todayYmd}T12:00:00`)
  const d = new Date(`${dueYmd}T12:00:00`)
  return Math.round((d.getTime() - t.getTime()) / 86400000)
}

/** 差分日数からリマインド種別。対象外は null */
export function bucketForDaysUntilDue(days: number): ReminderBucket | null {
  if (days === 3) return 'three_days'
  if (days === 1) return 'one_day'
  if (days === 0) return 'due_today'
  return null
}

/** 期限なし・完了・過去期限は除外し、バケット別に分類 */
export function classifyReminderTasks(
  tasks: TaskReminderInput[],
  todayYmd: string
): Record<ReminderBucket, TaskReminderInput[]> {
  const out: Record<ReminderBucket, TaskReminderInput[]> = {
    three_days: [],
    one_day: [],
    due_today: [],
  }
  for (const task of tasks) {
    if (task.done || !task.due?.trim()) continue
    const days = daysUntilDue(todayYmd, task.due.trim())
    if (days < 0) continue
    const b = bucketForDaysUntilDue(days)
    if (b) out[b].push(task)
  }
  return out
}

/** リマインド対象が1件も無いか */
export function hasNoReminders(classified: Record<ReminderBucket, TaskReminderInput[]>): boolean {
  return (
    classified.three_days.length === 0 &&
    classified.one_day.length === 0 &&
    classified.due_today.length === 0
  )
}
