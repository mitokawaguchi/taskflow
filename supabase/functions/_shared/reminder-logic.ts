/** Edge Function 用 — src/features/reminders/reminder-logic.ts と同期すること */
import type { ReminderBucket, TaskReminderInput } from './types.ts'

export function daysUntilDue(todayYmd: string, dueYmd: string): number {
  const t = new Date(`${todayYmd}T12:00:00`)
  const d = new Date(`${dueYmd}T12:00:00`)
  return Math.round((d.getTime() - t.getTime()) / 86400000)
}

export function bucketForDaysUntilDue(days: number): ReminderBucket | null {
  if (days === 3) return 'three_days'
  if (days === 1) return 'one_day'
  if (days === 0) return 'due_today'
  return null
}

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

export function hasNoReminders(classified: Record<ReminderBucket, TaskReminderInput[]>): boolean {
  return (
    classified.three_days.length === 0 &&
    classified.one_day.length === 0 &&
    classified.due_today.length === 0
  )
}
