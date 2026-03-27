import { useCallback, useEffect, useState } from 'react'
import type { TLEditorSnapshot } from 'tldraw'
import { fetchNote, updateNote } from '../../api/notes'
import { VALIDATION, truncateToMax } from '../../constants'
import { NoteEditorCanvas } from './NoteEditorCanvas'
import { NoteEditorTextArea } from './NoteEditorTextArea'

type Props = {
  noteId: string
  setView: (v: string) => void
  addToast: (icon: string, title: string, msg: string) => void
  setNoteDetailTitle: (title: string | null) => void
  theme: 'light' | 'dark'
}

function parseSnapshot(raw: unknown): TLEditorSnapshot | undefined {
  if (raw == null || typeof raw !== 'object') return undefined
  return raw as TLEditorSnapshot
}

export default function NoteEditorScreen({
  noteId,
  setView,
  addToast,
  setNoteDetailTitle,
  theme,
}: Readonly<Props>) {
  const [title, setTitle] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [snapshot, setSnapshot] = useState<TLEditorSnapshot | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const readOnly = false

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const n = await fetchNote(noteId)
      if (!n) {
        addToast('⚠️', 'メモが見つかりません', '')
        setView('notes')
        return
      }
      setTitle(n.title)
      setBodyText(n.bodyText ?? '')
      setNoteDetailTitle(n.title)
      setSnapshot(parseSnapshot(n.snapshot))
    } catch (e) {
      addToast('❌', '読み込みエラー', e instanceof Error ? e.message : String(e))
      setView('notes')
    } finally {
      setLoading(false)
    }
  }, [noteId, addToast, setView, setNoteDetailTitle])

  useEffect(() => {
    load()
  }, [load])

  const handleTitleBlur = useCallback(async () => {
    const next = truncateToMax(title, VALIDATION.noteTitle)
    if (next !== title) setTitle(next)
    try {
      const updated = await updateNote(noteId, { title: next })
      setNoteDetailTitle(updated.title)
    } catch (e) {
      addToast('❌', 'タイトルを保存できませんでした', e instanceof Error ? e.message : String(e))
    }
  }, [noteId, title, addToast, setNoteDetailTitle])

  const onSaveError = useCallback(
    (msg: string) => {
      addToast('❌', 'メモの保存に失敗しました', msg)
    },
    [addToast]
  )

  if (loading) {
    return <p className="text-muted">読み込み中...</p>
  }

  return (
    <div className="notes-editor-shell">
      <div className="notes-editor-toolbar">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setView('notes')} aria-label="一覧に戻る">
          ← 一覧
        </button>
        <label className="notes-editor-title-label">
          <span className="sr-only">メモのタイトル</span>
          <input
            type="text"
            className="notes-editor-title-input"
            value={title}
            maxLength={VALIDATION.noteTitle}
            placeholder="タイトル"
            readOnly={readOnly}
            onChange={(e) => {
              if (readOnly) return
              const v = e.target.value
              setTitle(v)
              setNoteDetailTitle(v)
            }}
            onBlur={handleTitleBlur}
            aria-label="メモのタイトル"
          />
        </label>
      </div>
      <NoteEditorTextArea noteId={noteId} initialBody={bodyText} addToast={addToast} readOnly={readOnly} />
      <div className="notes-canvas-section">
        <h2 className="notes-canvas-section__heading">手書き・図・付箋（任意）</h2>
        <p className="notes-canvas-section__hint text-muted">
          下は描画用の別パネルです。左のツールで鉛筆・消しゴム・テキスト（T）を選びます。テキストを置いたあとその文字を選ぶと、パネルでフォントやサイズを変えられます（本文欄とは別の仕組みです）。
        </p>
        <div className="notes-editor-canvas">
          <NoteEditorCanvas
            noteId={noteId}
            initialSnapshot={snapshot}
            theme={theme}
            onSaveError={onSaveError}
            readOnly={readOnly}
          />
        </div>
      </div>
    </div>
  )
}
