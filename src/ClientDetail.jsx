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
    <section className="client-detail" aria-label={`${client.name} の覚えておくこと`}>
      <div className="client-detail__header">
        <div className="client-detail__avatar" style={{ background: `${client.color}20` }}>
          {client.icon}
        </div>
        <div>
          <h2 className="client-detail__title">{client.name}</h2>
        </div>
      </div>

      <div className="client-detail__row">
        <input
          type="text"
          className="form-input flex-1"
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
        <p className="remember-empty-detail">まだありません。上の欄で追加できます。</p>
      ) : (
        <ul className="remember-list remember-list--detail">
          {remembers.map(r => (
            <li
              key={r.id}
              className="remember-item remember-item--editable"
              style={{ borderLeftColor: client.color }}
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
                    className="form-input remember-edit-input"
                    autoFocus
                  />
                  <div className="flex-gap-8">
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
                  <span className="remember-icon" aria-hidden>📌</span>
                  <div className="remember-item-content">
                    <div className="remember-body remember-body--strong">{r.body}</div>
                    <div className="remember-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => { setEditingId(r.id); setEditingBody(r.body) }}
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm remember-delete"
                        onClick={() => onDeleteRemember(r.id)}
                      >
                        削除
                      </button>
                    </div>
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
