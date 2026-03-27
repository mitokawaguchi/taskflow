import { afterEach, describe, expect, it } from 'vitest'
import {
  getBodyFontClassName,
  NOTE_BODY_FONT_STORAGE_KEY,
  readStoredBodyFontKey,
  writeStoredBodyFontKey,
} from './bodyFont'

describe('bodyFont', () => {
  afterEach(() => {
    globalThis.localStorage?.removeItem(NOTE_BODY_FONT_STORAGE_KEY)
  })

  it('getBodyFontClassName returns mapped class', () => {
    expect(getBodyFontClassName('mono')).toBe('notes-text-block__textarea--font-mono')
  })

  it('readStoredBodyFontKey returns system when unset', () => {
    expect(readStoredBodyFontKey()).toBe('system')
  })

  it('writeStoredBodyFontKey and read round-trip', () => {
    writeStoredBodyFontKey('serif')
    expect(readStoredBodyFontKey()).toBe('serif')
  })

  it('readStoredBodyFontKey ignores invalid stored value', () => {
    globalThis.localStorage?.setItem(NOTE_BODY_FONT_STORAGE_KEY, 'bogus')
    expect(readStoredBodyFontKey()).toBe('system')
  })
})
