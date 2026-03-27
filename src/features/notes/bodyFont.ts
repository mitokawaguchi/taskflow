/** 本文テキストエリアのフォント（見た目のみ・プレーンテキストは変わらない） */
export const NOTE_BODY_FONT_STORAGE_KEY = 'taskflow_memo_body_font'

export type NoteBodyFontKey = 'system' | 'serif' | 'mono' | 'rounded'

export const NOTE_BODY_FONT_OPTIONS: ReadonlyArray<{ key: NoteBodyFontKey; label: string; className: string }> = [
  { key: 'system', label: 'システム', className: 'notes-text-block__textarea--font-system' },
  { key: 'serif', label: '明朝', className: 'notes-text-block__textarea--font-serif' },
  { key: 'mono', label: '等幅', className: 'notes-text-block__textarea--font-mono' },
  { key: 'rounded', label: '丸ゴシック', className: 'notes-text-block__textarea--font-rounded' },
]

export function getBodyFontClassName(key: NoteBodyFontKey): string {
  const row = NOTE_BODY_FONT_OPTIONS.find((o) => o.key === key)
  return row?.className ?? 'notes-text-block__textarea--font-system'
}

export function readStoredBodyFontKey(): NoteBodyFontKey {
  if (globalThis.localStorage === undefined) return 'system'
  const raw = globalThis.localStorage.getItem(NOTE_BODY_FONT_STORAGE_KEY)
  if (raw === 'serif' || raw === 'mono' || raw === 'rounded' || raw === 'system') return raw
  return 'system'
}

export function writeStoredBodyFontKey(key: NoteBodyFontKey): void {
  if (globalThis.localStorage === undefined) return
  globalThis.localStorage.setItem(NOTE_BODY_FONT_STORAGE_KEY, key)
}
