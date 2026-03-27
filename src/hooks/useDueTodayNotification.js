import { useEffect } from 'react'
import { isToday } from '../utils'

const DUE_TODAY_CHECK_DELAY_MS = 2000
const DUE_TODAY_NOTIFY_THROTTLE_MS = 60 * 60 * 1000
const DUE_TODAY_NOTIFY_STORAGE_KEY = 'taskflow_due_today_notified_at'

/** 今日が期限のタスクのトースト・通知（useAppHandlers 行数削減） */
export function useDueTodayNotification(tasks, ui) {
  useEffect(() => {
    const checkDueToday = () => {
      const dueToday = tasks.filter((t) => !t.done && isToday(t.due))
      if (dueToday.length === 0 || !ui.notifyReminderEnabled) return
      const now = Date.now()
      const lastAt = Number.parseInt(localStorage.getItem(DUE_TODAY_NOTIFY_STORAGE_KEY) ?? '0', 10)
      if (now - lastAt < DUE_TODAY_NOTIFY_THROTTLE_MS) return
      localStorage.setItem(DUE_TODAY_NOTIFY_STORAGE_KEY, String(now))
      ui.addToast('⚠️', `今日が期限: ${dueToday.length}件`, dueToday.map((t) => t.title).join('、'))
      if (ui.notifGranted) {
        new globalThis.Notification('TaskFlow — 今日の期限', { body: dueToday.map((t) => t.title).join('\n') })
        if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 400])
      }
    }
    const timer = setTimeout(checkDueToday, DUE_TODAY_CHECK_DELAY_MS)
    return () => clearTimeout(timer)
  }, [tasks, ui.notifGranted, ui.addToast, ui.notifyReminderEnabled])
}
