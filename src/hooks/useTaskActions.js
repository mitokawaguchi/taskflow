import { useCallback } from 'react'
import { updateTask, insertTask } from '../api'
import { classifyApiError } from '../utils/apiError'

/** タスクの保存・トグル・ステータス移動を集約。ARCH-001 */
export function useTaskActions(tasks, setTasks, addToast, editTask, closeTaskForm) {
  const saveTask = useCallback(
    async (form) => {
      if (!form || typeof form.title !== 'string') {
        addToast('❌', '保存できませんでした', 'タスク名が不正です')
        return
      }
      if (!form.purpose || !String(form.purpose).trim()) {
        addToast('❌', '保存できませんでした', '目的は必須です')
        return
      }
      if (!editTask?.id) {
        const start = form.startDate != null && String(form.startDate).trim()
        const due = form.due != null && String(form.due).trim()
        if (!start || !due) {
          addToast('❌', '保存できませんでした', '開始日と期限を入力してください')
          return
        }
      }
      try {
        if (editTask?.id) {
          const updated = await updateTask(editTask.id, form)
          setTasks((ts) => ts.map((t) => (t.id === updated.id ? updated : t)))
          addToast('✏️', 'タスクを更新しました', form.title)
        } else {
          const status = form.status || 'todo'
          const newTask = {
            ...form,
            id: `t-${crypto.randomUUID()}`,
            done: status === 'done',
            status,
            created: Date.now(),
          }
          const created = await insertTask(newTask)
          setTasks((ts) => [created, ...ts])
          addToast('✅', 'タスクを追加しました', form.title)
        }
        closeTaskForm()
      } catch (e) {
        const kind = classifyApiError(e)
        const msg = kind === 'network' ? 'ネットワークエラー。接続を確認してください。' : (e?.message ?? '')
        addToast('❌', '保存できませんでした', msg)
      }
    },
    [editTask?.id, addToast, closeTaskForm]
  )

  const toggleTask = useCallback(
    async (id) => {
      const task = tasks.find((t) => t.id === id)
      if (!task) return
      const willComplete = !task.done
      try {
        const updated = await updateTask(id, { done: willComplete, status: willComplete ? 'done' : 'todo' })
        setTasks((ts) => ts.map((t) => (t.id === id ? updated : t)))
        if (willComplete) addToast('🎉', '完了！', task.title)
      } catch (e) {
        addToast('❌', '更新できませんでした', e?.message ?? '')
      }
    },
    [tasks, addToast]
  )

  const moveTaskStatus = useCallback(
    async (taskId, newStatus) => {
      try {
        const updated = await updateTask(taskId, { status: newStatus, done: newStatus === 'done' })
        setTasks((ts) => ts.map((t) => (t.id === taskId ? updated : t)))
      } catch (e) {
        addToast('❌', '状態の更新に失敗しました', e?.message ?? '')
      }
    },
    [addToast]
  )

  return { saveTask, toggleTask, moveTaskStatus }
}
