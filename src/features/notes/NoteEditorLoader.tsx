import { lazy, Suspense } from 'react'

const NoteEditorScreen = lazy(() => import('./NoteEditorScreen'))

type Props = {
  noteId: string
  setView: (v: string) => void
  addToast: (icon: string, title: string, msg: string) => void
  setNoteDetailTitle: (title: string | null) => void
  theme: 'light' | 'dark'
}

export function NoteEditorLoader(props: Readonly<Props>) {
  return (
    <Suspense fallback={<p className="text-muted">エディタを読み込み中...</p>}>
      <NoteEditorScreen {...props} />
    </Suspense>
  )
}
