import { useEffect, useState, type ComponentProps } from 'react'
import { Tldraw, getSnapshot, type TLEditorSnapshot } from 'tldraw'
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
  initialSnapshot: TLEditorSnapshot | undefined
  theme: 'light' | 'dark'
  onSaveError: (message: string) => void
}

type TldrawEditor = Parameters<NonNullable<ComponentProps<typeof Tldraw>['onMount']>>[0]

/** tldraw 本体とドキュメント自動保存（遅延読み込みチャンク用） */
export function NoteEditorCanvas({ noteId, initialSnapshot, theme, onSaveError }: Readonly<Props>) {
  const [editor, setEditor] = useState<TldrawEditor | null>(null)

  useEffect(() => {
    if (!editor) return
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
  }, [editor, noteId, onSaveError])

  return (
    <Tldraw
      key={noteId}
      snapshot={initialSnapshot}
      onMount={setEditor}
      colorScheme={theme === 'dark' ? 'dark' : 'light'}
    />
  )
}
