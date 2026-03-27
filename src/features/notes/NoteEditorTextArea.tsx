import { useCallback, useEffect, useRef, useState } from 'react'
import { updateNote } from '../../api/notes'
import { VALIDATION } from '../../constants'

const DEBOUNCE_MS = 1200

type Props = {
  noteId: string
  initialBody: string
  addToast: (icon: string, title: string, msg: string) => void
}

/** メモ本文（プレーンテキスト）— ここが「書く場所」の主役 */
export function NoteEditorTextArea({ noteId, initialBody, addToast }: Readonly<Props>) {
  const [value, setValue] = useState(initialBody)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSentRef = useRef(initialBody)

  useEffect(() => {
    setValue(initialBody)
    lastSentRef.current = initialBody
  }, [noteId, initialBody])

  const flushSave = useCallback(
    async (text: string) => {
      if (text === lastSentRef.current) return
      if (text.length > VALIDATION.noteBody) {
        addToast('⚠️', '本文が長すぎます', `${VALIDATION.noteBody}文字以内にしてください`)
        return
      }
      try {
        await updateNote(noteId, { bodyText: text })
        lastSentRef.current = text
      } catch (e) {
        addToast('❌', '本文を保存できませんでした', e instanceof Error ? e.message : String(e))
      }
    },
    [noteId, addToast]
  )

  const scheduleSave = useCallback(
    (text: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        timerRef.current = null
        flushSave(text)
      }, DEBOUNCE_MS)
    },
    [flushSave]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className="notes-text-block">
      <label htmlFor={`note-body-${noteId}`} className="notes-text-block__label">
        メモ（テキスト）
      </label>
      <p className="notes-text-block__hint text-muted">キーボードで書く場合はここ。手書きは下の「手書き・図」エリアを使います。</p>
      <textarea
        id={`note-body-${noteId}`}
        className="notes-text-block__textarea"
        value={value}
        maxLength={VALIDATION.noteBody}
        placeholder="ここにメモを書いてください…"
        rows={8}
        onChange={(e) => {
          const next = e.target.value
          setValue(next)
          scheduleSave(next)
        }}
        onBlur={() => flushSave(value)}
        spellCheck
      />
    </div>
  )
}
