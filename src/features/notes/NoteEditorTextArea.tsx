import { useCallback, useEffect, useRef, useState } from 'react'
import { updateNote } from '../../api/notes'
import { VALIDATION } from '../../constants'
import {
  getBodyFontClassName,
  NOTE_BODY_FONT_OPTIONS,
  type NoteBodyFontKey,
  readStoredBodyFontKey,
  writeStoredBodyFontKey,
} from './bodyFont'

const DEBOUNCE_MS = 1200

type Props = {
  noteId: string
  initialBody: string
  addToast: (icon: string, title: string, msg: string) => void
  readOnly: boolean
}

/** メモ本文（プレーンテキスト）— ここが「書く場所」の主役 */

export function NoteEditorTextArea({ noteId, initialBody, addToast, readOnly }: Readonly<Props>) {
  const [value, setValue] = useState(initialBody)
  const [bodyFont, setBodyFont] = useState<NoteBodyFontKey>(() => readStoredBodyFontKey())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSentRef = useRef(initialBody)

  useEffect(() => {
    setValue(initialBody)
    lastSentRef.current = initialBody
  }, [noteId, initialBody])

  const flushSave = useCallback(
    async (text: string) => {
      if (readOnly) return
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
    [noteId, addToast, readOnly]
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

  const handleFontChange = useCallback((key: NoteBodyFontKey) => {
    setBodyFont(key)
    writeStoredBodyFontKey(key)
  }, [])

  return (
    <div className="notes-text-block">
      <label htmlFor={`note-body-${noteId}`} className="notes-text-block__label">
        メモ（テキスト）
      </label>
      <p className="notes-text-block__hint text-muted">
        {readOnly
          ? '閲覧のみです。編集は iPad でこのメモを開いてください。'
          : 'プレーンテキストのみです（太字・色・装飾はありません）。下のフォントはこの欄の見た目だけ変えます。手書きはさらに下のキャンバスです。'}
      </p>
      {!readOnly && (
        <div className="notes-text-block__font-row">
          <label htmlFor={`note-body-font-${noteId}`} className="notes-text-block__font-label">
            フォント（見た目）
          </label>
          <select
            id={`note-body-font-${noteId}`}
            className="notes-text-block__font-select"
            value={bodyFont}
            onChange={(e) => handleFontChange(e.target.value as NoteBodyFontKey)}
            aria-label="本文のフォント（見た目）"
          >
            {NOTE_BODY_FONT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}
      <textarea
        id={`note-body-${noteId}`}
        className={`notes-text-block__textarea ${getBodyFontClassName(bodyFont)} ${readOnly ? 'notes-text-block__textarea--readonly' : ''}`}
        value={value}
        readOnly={readOnly}
        maxLength={VALIDATION.noteBody}
        placeholder={readOnly ? '（閲覧のみ）' : 'ここにメモを書いてください…'}
        rows={8}
        onChange={(e) => {
          if (readOnly) return
          const next = e.target.value
          setValue(next)
          scheduleSave(next)
        }}
        onBlur={() => flushSave(value)}
        spellCheck={!readOnly}
      />
    </div>
  )
}
