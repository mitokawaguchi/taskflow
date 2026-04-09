import { today } from '../utils'

export function daysFromToday(d) {
  if (!d) return null
  const base = new Date(`${today()}T12:00:00`)
  const target = new Date(`${d}T12:00:00`)
  return Math.round((target - base) / 86400000)
}

export function isDueSoonTask(task, days = 3) {
  const diff = daysFromToday(task?.due)
  return diff !== null && diff > 0 && diff <= days
}

function isActiveTodayTask(task) {
  if (!task?.startDate || !task?.due) return false
  const todayStr = today()
  return task.startDate <= todayStr && task.due >= todayStr
}

/** 「今週タスク」ビューに含めるか（useTaskFilters と同一） */
export function isRelevantForTodayViewTask(task) {
  if (!task) return false
  return task.startDate === today() || task.due === today() || isActiveTodayTask(task) || isDueSoonTask(task)
}

/** TaskListWithFilters のセクション分割（同一ロジック） */
export function partitionTasksIntoWeekSections(tasks) {
  const todayStr = today()
  const dueToday = []
  const startsToday = []
  const activeNow = []
  const dueSoon = []
  const otherRelevant = []

  tasks.forEach((task) => {
    if (task.due === todayStr) {
      dueToday.push(task)
      return
    }
    if (task.startDate === todayStr) {
      startsToday.push(task)
      return
    }
    if (task.startDate && task.due && task.startDate < todayStr && task.due > todayStr) {
      activeNow.push(task)
      return
    }
    if (isDueSoonTask(task)) {
      dueSoon.push(task)
      return
    }
    otherRelevant.push(task)
  })

  return [
    { key: 'due-today', title: '今日期限', subtitle: '今日中に締めたいタスク', tasks: dueToday },
    { key: 'start-today', title: '今日開始', subtitle: '今日から動き始めるタスク', tasks: startsToday },
    { key: 'active-now', title: '期間内', subtitle: '今日が実行期間に入っているタスク', tasks: activeNow },
    { key: 'due-soon', title: '期限間近', subtitle: '3日以内に期限が来るタスク', tasks: dueSoon },
    { key: 'other', title: 'その他', subtitle: '今週タスクに表示されるその他のタスク', tasks: otherRelevant },
  ].filter((section) => section.tasks.length > 0)
}
