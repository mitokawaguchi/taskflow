/** Edge Function 用 — src/features/reminders/reminder-messages.ts と同期すること */
import type { ReminderBucket, TaskReminderInput } from './types.ts'

const HEADER: Record<ReminderBucket, string> = {
  three_days: '[リマインド] ⚠️ 3日後が期限です',
  one_day: '[リマインド] 🔴 明日が期限です',
  due_today: '[リマインド] 🚨 今日が期限です！',
}

export function formatTaskBlock(task: TaskReminderInput): string {
  const pj = task.projectName.trim() || '（未設定）'
  return `タスク: ${task.title}\nPJ: ${pj}\n期限: ${task.due ?? ''}`
}

export function formatBucketMessage(bucket: ReminderBucket, tasks: TaskReminderInput[]): string {
  if (tasks.length === 0) return ''
  const lines = tasks.map((t) => formatTaskBlock(t))
  return `${HEADER[bucket]}\n\n${lines.join('\n\n---\n\n')}`
}

export function formatCombinedChatworkBody(
  classified: Record<ReminderBucket, TaskReminderInput[]>
): string {
  const parts: string[] = []
  ;( ['three_days', 'one_day', 'due_today'] as const).forEach((key) => {
    const msg = formatBucketMessage(key, classified[key])
    if (msg) parts.push(msg)
  })
  return parts.join('\n\n━━━━━━━━\n\n')
}
