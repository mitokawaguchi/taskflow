import { useCallback, useEffect, useState } from 'react'
import type { Editor, TLEditorSnapshot, TLStoreSnapshot } from '@tldraw/editor'
import { Tldraw, getSnapshot } from 'tldraw'
import 'tldraw/tldraw.css'
import { updateNote } from '../../api/notes'

const SAVE_DEBOUNCE_MS = 2000

function errToMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return '保存に失敗しました'
}

type Props = {
  noteId: string
  /** `<Tldraw snapshot={...} />` と同型（Partial 不可・document 必須） */
  initialSnapshot: TLEditorSnapshot | TLStoreSnapshot | undefined
  theme: 'light' | 'dark'
  onSaveError: (message: string) => void
  /** PC 等では true（保存・編集ツールなし） */
  readOnly: boolean
}

/** tldraw 本体とドキュメント自動保存（遅延読み込みチャンク用） */
export function NoteEditorCanvas({ noteId, initialSnapshot, theme, onSaveError, readOnly }: Readonly<Props>) {
  const [editor, setEditor] = useState<Editor | null>(null)

  useEffect(() => {
    if (!editor || readOnly) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const scheduleSave = (): void => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        const snap = getSnapshot(editor.store)
        updateNote(noteId, { snapshot: snap as unknown })
          .then(() => {})
          .catch((err: unknown) => {
            onSaveError(errToMessage(err))
          })
      }, SAVE_DEBOUNCE_MS)
    }
    const unsub = editor.store.listen(scheduleSave, { scope: 'document', source: 'user' })
    return () => {
      if (timer) clearTimeout(timer)
      unsub()
    }
  }, [editor, noteId, onSaveError, readOnly])

  const handleMount = useCallback(
    (ed: Editor) => {
      ed.user.updateUserPreferences({
        colorScheme: theme === 'dark' ? 'dark' : 'light',
      })
      if (readOnly) {
        ed.updateInstanceState({ isReadonly: true })
      } else {
        setEditor(ed)
      }
    },
    [readOnly, theme]
  )

  return (
    <Tldraw key={noteId} snapshot={initialSnapshot} onMount={handleMount} inferDarkMode={false} />
  )
}
