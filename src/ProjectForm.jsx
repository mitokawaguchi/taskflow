import { useState, useEffect } from 'react'
import CalendarPicker from './CalendarPicker'
import { VALIDATION, truncateToMax } from './constants'

const ICONS   = ['📁','🏢','🤝','⚡','🎯','💡','🔬','🎨','🚀','📊','🏗','💼']
const COLORS  = ['#2d6b3f','#ff4560','#ff8c42','#ffd166','#06d6a0','#00b4d8','#e040fb']

export default function ProjectForm({ project, onSave, onClose }) {
  const [name, setName] = useState(project?.name ?? '')
  const [icon, setIcon] = useState(project?.icon ?? '📁')
  const [color, setColor] = useState(project?.color ?? COLORS[0])
  const [endDate, setEndDate] = useState(project?.endDate ?? '')

  useEffect(() => {
    if (project) {
      setName(project.name)
      setIcon(project.icon ?? '📁')
      setColor(project.color ?? COLORS[0])
      setEndDate(project.endDate ?? '')
    }
  }, [project])

  const isEdit = Boolean(project)

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:'380px' }}>
        <div className="modal-title">{isEdit ? 'プロジェクトを編集' : '新しいプロジェクト'}</div>

        <div className="form-group">
          <label className="form-label">アイコン</label>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {ICONS.map(ic => (
              <button key={ic} onClick={() => setIcon(ic)}
                style={{ width:'36px', height:'36px', borderRadius:'8px', border:`2px solid ${icon===ic?'var(--accent)':'var(--border)'}`, background:'var(--surface2)', fontSize:'18px', cursor:'pointer' }}>
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">プロジェクト名 *</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="プロジェクト名" autoFocus />
        </div>

        <div className="form-group">
          <label className="form-label">カラー</label>
          <div style={{ display:'flex', gap:'8px' }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)}
                style={{ width:'28px', height:'28px', borderRadius:'50%', background:c, border:`3px solid ${color===c?'var(--text)':'transparent'}`, cursor:'pointer' }} />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label form-label--emphasis">終了日（任意）</label>
          {endDate && (
            <div className="form-due-display">
              {endDate}
            </div>
          )}
          <CalendarPicker
            value={endDate}
            onChange={setEndDate}
            onClear={() => setEndDate('')}
          />
          <div style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'4px' }}>設定すると「残り○日」で表示されます</div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>キャンセル</button>
          <button className="btn btn-primary" onClick={() => { if (name.trim()) onSave({ name: truncateToMax(name, VALIDATION.projectName), icon, color, endDate: endDate || '' }) }} disabled={!name.trim()}>
            {isEdit ? '保存' : '作成'}
          </button>
        </div>
      </div>
    </div>
  )
}
