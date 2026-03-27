import { describe, it, expect } from 'vitest'
import { detectIpadMemoEditingFromEnv } from './memoDevice'

describe('detectIpadMemoEditingFromEnv', () => {
  it('UA に iPad が含まれると true', () => {
    expect(detectIpadMemoEditingFromEnv('Mozilla/5.0 (iPad; ...)', 'iPad', 5)).toBe(true)
  })
  it('Macintosh だがタッチポイントが複数なら iPadOS の可能性で true', () => {
    expect(detectIpadMemoEditingFromEnv('Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'MacIntel', 5)).toBe(true)
  })
  it('通常の PC（タッチなし MacIntel）は false', () => {
    expect(detectIpadMemoEditingFromEnv('Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'MacIntel', 0)).toBe(false)
  })
  it('iPhone は false（編集は iPad のみ）', () => {
    expect(detectIpadMemoEditingFromEnv('Mozilla/5.0 (iPhone; ...)', 'iPhone', 5)).toBe(false)
  })
})
