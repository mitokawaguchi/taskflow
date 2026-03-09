import { useState } from 'react'
import { PRIORITY, TASK_STATUS, TASK_STATUS_KEYS, categoriesToOptions } from './constants'
import { formatDate, isToday, isTomorrow } from './utils'
import CalendarPicker from './CalendarPicker'

export default function TaskForm({ task, projects, templates, categories = [], onSave, onClose }) {
  const categoryOptions = categoriesToOptions(categories)
  const [form, setForm] = useState(
    task
      ? { title:'', desc:'', priority:'medium', projectId: projects[0]?.id || '', due:'', done:false, status:'todo', category: '', ...task }
      : { title:'', desc:'', priority:'medium', projectId: task?.projectId ?? projects[0]?.id ?? '', due:'', done:false, status: task?.status ?? 'todo', category: '' }
  )
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
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
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
          <select className="form-input" value={form.category ?? ''} onChange={e => set('category', e.target.value)}>
            <option value="">なし</option>
            {categoryOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
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
          <button className="btn btn-primary" onClick={() => { if (form.title.trim()) onSave({ ...form, category: form.category || null }) }} disabled={!form.title.trim()}>保存</button>
        </div>
      </div>
    </div>
  )
}
