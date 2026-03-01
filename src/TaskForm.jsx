import { useState } from 'react'
import { PRIORITY } from './constants'
import CalendarPicker from './CalendarPicker'

export default function TaskForm({ task, projects, templates, onSave, onClose }) {
  const [form, setForm] = useState(
    task
      ? { title:'', desc:'', priority:'medium', projectId: projects[0]?.id || '', due:'', done:false, ...task }
      : { title:'', desc:'', priority:'medium', projectId: projects[0]?.id || '', due:'', done:false }
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
          <label className="form-label">期限</label>
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
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>キャンセル</button>
          <button className="btn btn-primary" onClick={() => { if (form.title.trim()) onSave(form) }} disabled={!form.title.trim()}>保存</button>
        </div>
      </div>
    </div>
  )
}
