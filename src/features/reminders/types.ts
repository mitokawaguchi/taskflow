/** 期限までの日数に応じたリマインド種別（3日後・翌日・当日のみ） */
export type ReminderBucket = 'three_days' | 'one_day' | 'due_today'

/** 判定用の最小タスク情報 */
export type TaskReminderInput = {
  id: string
  title: string
  due: string | null
  done: boolean
  projectName: string
}
