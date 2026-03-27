import { useCallback, useEffect, useState } from 'react'
import { deleteNote, fetchNotes, insertNote } from '../../api/notes'
import type { Note } from '../../types'

type Props = {
  setView: (v: string) => void
  addToast: (icon: string, title: string, msg: string) => void
}

function formatUpdated(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return d.toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return ''
  }
}

export default function NotesScreen({ setView, addToast }: Readonly<Props>) {
  const [items, setItems] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await fetchNotes()
      setItems(list)
    } catch (e) {
      addToast('❌', 'メモ一覧を読み込めませんでした', e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = useCallback(async () => {
    const id = crypto.randomUUID()
    try {
      await insertNote({ id, title: '無題のメモ' })
      setView(`n:${id}`)
    } catch (e) {
      addToast('❌', 'メモを作成できませんでした', e instanceof Error ? e.message : String(e))
    }
  }, [addToast, setView])

  const handleDelete = useCallback(
    async (id: string, title: string) => {
      if (!globalThis.confirm(`「${title}」を削除しますか？`)) return
      try {
        await deleteNote(id)
        setItems((prev) => prev.filter((n) => n.id !== id))
        addToast('🗑', 'メモを削除しました', '')
      } catch (e) {
        addToast('❌', '削除できませんでした', e instanceof Error ? e.message : String(e))
      }
    },
    [addToast]
  )

  if (loading) {
    return <p className="text-muted">読み込み中...</p>
  }

  return (
    <div className="notes-screen">
      <p className="notes-screen__lead text-muted">
        「新しいメモ」で作成すると、<strong>上から順に</strong> タイトル → <strong>テキスト入力欄</strong> → 手書き用キャンバスが開きます。まずは真ん中の大きな欄にキーボードで書けばOKです。
      </p>
      <div className="toolbar-row">
        <button type="button" className="btn btn-primary" onClick={handleCreate}>
          + 新しいメモ
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-muted">メモはまだありません。</p>
      ) : (
        <ul className="notes-list" aria-label="メモ一覧">
          {items.map((n) => (
            <li key={n.id} className="notes-list__item">
              <button type="button" className="notes-list__link" onClick={() => setView(`n:${n.id}`)}>
                <span className="notes-list__title">{n.title || '無題のメモ'}</span>
                <span className="notes-list__meta">{formatUpdated(n.updatedAt)}</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm notes-list__delete"
                onClick={() => handleDelete(n.id, n.title || '無題のメモ')}
                aria-label={`${n.title || '無題のメモ'}を削除`}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
