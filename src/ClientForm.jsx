import { useState } from 'react'

const ICONS = ['🤝', '🏢', '👤', '💼', '📊', '🎯', '⚡', '🔬', '🎨', '🚀', '📁', '💡']
const COLORS = ['#2d6b3f', '#ff4560', '#ff8c42', '#ffd166', '#06d6a0', '#00b4d8', '#e040fb']

export default function ClientForm({ onSave, onClose }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🤝')
  const [color, setColor] = useState(COLORS[0])

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '380px' }}>
        <div className="modal-title">新しいクライアント</div>

        <div className="form-group">
          <label className="form-label">アイコン</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {ICONS.map(ic => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: `2px solid ${icon === ic ? 'var(--accent)' : 'var(--border)'}`,
                  background: 'var(--surface2)',
                  fontSize: '18px',
                  cursor: 'pointer',
                }}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">クライアント名 *</label>
          <input
            className="form-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="取引先・担当先の名前"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">カラー</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {COLORS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: c,
                  border: `3px solid ${color === c ? 'var(--text)' : 'transparent'}`,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>キャンセル</button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => { if (name.trim()) onSave({ name, icon, color }) }}
            disabled={!name.trim()}
          >
            作成
          </button>
        </div>
      </div>
    </div>
  )
}
