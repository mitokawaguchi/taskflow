import { useState } from 'react'
import { PRIORITY } from './constants'

const DEFAULT_FORM = { title: '', desc: '', priority: 'medium' }

export default function TemplateForm({ template, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(() =>
    template ? { title: template.title, desc: template.desc ?? '', priority: template.priority ?? 'medium' } : { ...DEFAULT_FORM }
  )
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const isEdit = Boolean(template?.id)

  const handleSave = () => {
    if (!form.title.trim()) return
    onSave(isEdit ? { ...form, id: template.id } : form)
  }

  const handleDelete = () => {
    if (isEdit && globalThis.confirm('このテンプレートを削除しますか？')) {
      onDelete(template.id)
    }
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '400px' }}>
        <div className="modal-title">{isEdit ? 'テンプレートを編集' : 'テンプレートを作成'}</div>
        <div className="form-group">
          <label className="form-label">テンプレート名</label>
          <input
            className="form-input"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="例: 週次レポート作成"
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">デフォルト詳細</label>
          <textarea
            className="form-textarea"
            value={form.desc}
            onChange={(e) => set('desc', e.target.value)}
            placeholder="テンプレートの説明"
          />
        </div>
        <div className="form-group">
          <label className="form-label">デフォルト重要度</label>
          <select className="form-select" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            {Object.entries(PRIORITY).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          {isEdit && (
            <button type="button" className="btn btn-ghost btn-danger" onClick={handleDelete} style={{ marginRight: 'auto' }}>
              削除
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            キャンセル
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
