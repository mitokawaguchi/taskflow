import { useState } from 'react'

export default function ClientDetail({
  client,
  remembers,
  onAddRemember,
  onUpdateRemember,
  onDeleteRemember,
}) {
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingBody, setEditingBody] = useState('')

  return (
    <section style={{ marginBottom: '32px' }} aria-label={`${client.name} の覚えておくこと`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${client.color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
          }}
        >
          {client.icon}
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{client.name}</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            今後に向けて覚えておくこと（このクライアント用）
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="言われたこと・覚えておきたいことをメモ..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAddRemember(client.id, input)
              setInput('')
            }
          }}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            onAddRemember(client.id, input)
            setInput('')
          }}
          disabled={!input.trim()}
        >
          追加
        </button>
      </div>

      {remembers.length === 0 ? (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>まだありません。上の欄で追加できます。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {remembers.map(r => (
            <li
              key={r.id}
              style={{
                padding: '10px 12px',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                marginBottom: '8px',
              }}
            >
              {editingId === r.id ? (
                <>
                  <input
                    type="text"
                    className="form-input"
                    value={editingBody}
                    onChange={e => setEditingBody(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        onUpdateRemember(r.id, editingBody)
                        setEditingId(null)
                      }
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    style={{ marginBottom: '8px', width: '100%' }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => { onUpdateRemember(r.id, editingBody); setEditingId(null) }}
                    >
                      保存
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                      キャンセル
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '14px', marginBottom: '6px' }}>{r.body}</div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => { setEditingId(r.id); setEditingBody(r.body) }}
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--critical)' }}
                      onClick={() => onDeleteRemember(r.id)}
                    >
                      削除
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
