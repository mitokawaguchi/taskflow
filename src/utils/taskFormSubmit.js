import { VALIDATION, truncateToMax } from '../constants'

/**
 * 保存前チェック。問題なければ null、メッセージは useTaskActions と同文言。
 * @param {object} form
 * @param {boolean} isEditingExisting task.id あり
 * @returns {string | null}
 */
export function getTaskFormValidationMessage(form, isEditingExisting) {
  if (!form.title.trim()) {
    return 'タスク名を入力してください'
  }
  if (!form.purpose.trim()) {
    return '目的は必須です'
  }
  if (!isEditingExisting) {
    const start = form.startDate != null && String(form.startDate).trim()
    const due = form.due != null && String(form.due).trim()
    if (!start || !due) {
      return '開始日と期限を入力してください'
    }
  }
  return null
}

/** TaskForm → saveTask 用ペイロード */
export function buildTaskSavePayload(form) {
  const hyp = form.hypothesis != null && String(form.hypothesis).trim()
    ? truncateToMax(String(form.hypothesis).trim(), VALIDATION.taskHypothesis)
    : null
  return {
    title: truncateToMax(form.title, VALIDATION.taskTitle),
    desc: truncateToMax(form.desc, VALIDATION.taskDesc),
    purpose: truncateToMax(form.purpose, VALIDATION.taskPurpose),
    priority: form.priority || 'medium',
    projectId: form.projectId || null,
    due: form.due && String(form.due).trim() ? String(form.due).trim() : null,
    startDate: form.startDate && String(form.startDate).trim() ? String(form.startDate).trim() : null,
    status: form.status || 'todo',
    category: form.category && String(form.category).trim() ? form.category : null,
    assigneeId: form.assigneeId && String(form.assigneeId).trim() ? form.assigneeId : null,
    hypothesis: hyp,
    timeboxMinutes:
      form.timeboxMinutes != null && Number.isFinite(form.timeboxMinutes) && form.timeboxMinutes > 0
        ? form.timeboxMinutes
        : null,
    premortemRisks: Array.isArray(form.premortemRisks) ? form.premortemRisks : [],
  }
}
