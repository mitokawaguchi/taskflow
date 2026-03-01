import { useState } from 'react'
import { PRIORITY } from './constants'

export default function TemplateForm({ onSave, onClose }) {
  const [form, setForm] = useState({ title: '', desc: '', priority: 'medium' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:'400px' }}>
        <div className="modal-title">テンプレートを作成</div>
        <div className="form-group">
          <label className="form-label">テンプレート名</label>
          <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="例: 週次レポート作成" autoFocus />
        </div>
        <div className="form-group">
          <label className="form-label">デフォルト詳細</label>
          <textarea className="form-textarea" value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="テンプレートの説明" />
        </div>
        <div className="form-group">
          <label className="form-label">デフォルト重要度</label>
          <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
            {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>キャンセル</button>
          <button className="btn btn-primary" onClick={() => { if (form.title.trim()) onSave(form) }}>保存</button>
        </div>
      </div>
    </div>
  )
}
