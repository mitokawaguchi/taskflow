import { useState, useRef, useEffect } from 'react'
import { PRIORITY, TASK_STATUS, TASK_STATUS_KEYS, VALIDATION, truncateToMax, categoriesToOptions } from './constants'
import { formatDate, isToday, isTomorrow } from './utils'
import CalendarPicker from './CalendarPicker'

const DEFAULT_FORM = {
  title: '',
  desc: '',
  priority: 'medium',
  projectId: '',
  startDate: '',
  due: '',
  done: false,
  status: 'todo',
  category: '',
  assigneeId: '',
}

/** 編集対象（id あり）または新規用ヒント（projectId/status 等）から初期フォーム値を生成 */
function getInitialTaskForm(task, projects) {
  const defaultProjectId = projects[0]?.id ?? ''
  if (task && task.id) {
    return { ...DEFAULT_FORM, projectId: defaultProjectId, ...task }
  }
  if (task && typeof task === 'object') {
    return {
      ...DEFAULT_FORM,
      projectId: task.projectId ?? defaultProjectId,
      startDate: task.startDate ?? '',
      due: task.due ?? '',
      status: task.status ?? 'todo',
      assigneeId: task.assigneeId ?? '',
    }
  }
  return { ...DEFAULT_FORM, projectId: defaultProjectId }
}

export default function TaskForm({ task, projects, templates, categories = [], users = [], onSave, onClose }) {
  const categoryOptions = categoriesToOptions(categories)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const categoryPickerRef = useRef(null)
  useEffect(() => {
    if (!categoryOpen) return
    const close = (e) => {
      if (categoryPickerRef.current && !categoryPickerRef.current.contains(e.target)) setCategoryOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [categoryOpen])
  const [form, setForm] = useState(() => getInitialTaskForm(task, projects))
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const applyTemplate = (t) => setForm(f => ({ ...f, title: t.title, desc: t.desc, priority: t.priority }))

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header-with-back">
          <button type="button" className="btn btn-ghost btn-sm modal-back" onClick={onClose} aria-label="戻る">
            ← 戻る
          </button>
          <div className="modal-title">{task?.id ? 'タスクを編集' : '新しいタスク'}</div>
        </div>

        {templates.length > 0 && !task?.id && (
          <div className="form-group">
            <label className="form-label">テンプレートから</label>
            <div className="flex-gap-6-wrap">
              {templates.map(t => (
                <button key={t.id} className="btn btn-ghost btn-sm" onClick={() => applyTemplate(t)}>{t.title}</button>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">タスク名 *</label>
          <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="タスク名を入力..." autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">詳細</label>
          <textarea className="form-textarea" value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="詳細メモ（任意）" />
        </div>
        <div className="form-group">
          <label className="form-label">重要度</label>
          <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
            {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">開始日</label>
          {form.startDate && (
            <div className="form-due-display">
              {form.startDate}（{formatDate(form.startDate)}）
            </div>
          )}
          <CalendarPicker
            value={form.startDate || ''}
            onChange={(v) => set('startDate', v || '')}
            onClear={() => set('startDate', '')}
          />
        </div>
        <div className="form-group">
          <label className="form-label form-label--emphasis">期限</label>
          {form.due && (
            <div className={`form-due-display ${isToday(form.due) || isTomorrow(form.due) ? 'form-due-display--urgent' : ''}`}>
              {form.due}（{formatDate(form.due)}）
            </div>
          )}
          <CalendarPicker
            value={form.due}
            onChange={(v) => set('due', v)}
            onClear={() => set('due', '')}
          />
        </div>
        <div className="form-group">
          <label className="form-label">プロジェクト</label>
          <select className="form-select" value={form.projectId} onChange={e => set('projectId', e.target.value)}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">カテゴリ</label>
          <div className="form-category-picker" ref={categoryPickerRef}>
            <button
              type="button"
              className="form-category-picker__trigger"
              onClick={() => setCategoryOpen(o => !o)}
              aria-expanded={categoryOpen}
              aria-haspopup="listbox"
              aria-label="カテゴリを選択"
            >
              {form.category ? (() => {
                const opt = categoryOptions.find(o => o.id === form.category)
                return opt ? (
                  <>
                    <span className="form-category-picker__swatch" style={{ background: opt.color }} aria-hidden />
                    <span>{opt.label}</span>
                  </>
                ) : (
                  <span className="form-category-picker__empty">なし</span>
                )
              })() : (
                <span className="form-category-picker__empty">なし</span>
              )}
            </button>
            {categoryOpen && (
              <ul className="form-category-picker__list" role="listbox">
                <li role="option" aria-selected={!form.category}>
                  <button type="button" className="form-category-picker__option" onClick={() => { set('category', ''); setCategoryOpen(false) }}>
                    <span className="form-category-picker__swatch form-category-picker__swatch--none" aria-hidden />
                    <span>なし</span>
                  </button>
                </li>
                {categoryOptions.map((opt) => (
                  <li key={opt.id} role="option" aria-selected={form.category === opt.id}>
                    <button
                      type="button"
                      className="form-category-picker__option"
                      onClick={() => { set('category', opt.id); setCategoryOpen(false) }}
                    >
                      <span className="form-category-picker__swatch" style={{ background: opt.color }} aria-hidden />
                      <span>{opt.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">担当者</label>
          <select className="form-select" value={form.assigneeId ?? ''} onChange={e => set('assigneeId', e.target.value)}>
            <option value="">なし</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">状態</label>
          <select className="form-select" value={form.status || 'todo'} onChange={e => set('status', e.target.value)}>
            {TASK_STATUS_KEYS.map(k => (
              <option key={k} value={k}>{TASK_STATUS[k].label}</option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>キャンセル</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!form.title.trim()) return
              const payload = {
                title: truncateToMax(form.title, VALIDATION.taskTitle),
                desc: truncateToMax(form.desc, VALIDATION.taskDesc),
                priority: form.priority || 'medium',
                projectId: form.projectId || null,
                due: form.due && String(form.due).trim() ? String(form.due).trim() : null,
                startDate: form.startDate && String(form.startDate).trim() ? String(form.startDate).trim() : null,
                status: form.status || 'todo',
                category: form.category && String(form.category).trim() ? form.category : null,
                assigneeId: form.assigneeId && String(form.assigneeId).trim() ? form.assigneeId : null,
              }
              onSave(payload)
            }}
            disabled={!form.title.trim()}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
