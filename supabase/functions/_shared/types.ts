/** Edge Function 用 — src/features/reminders/types.ts と同期すること */
export type ReminderBucket = 'three_days' | 'one_day' | 'due_today'

export type TaskReminderInput = {
  id: string
  title: string
  due: string | null
  done: boolean
  projectName: string
}
