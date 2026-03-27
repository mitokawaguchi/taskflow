import { describe, it, expect } from 'vitest'
import { getViewTitle } from './viewTitle'

const emptyOpts = { projects: [], clients: [], noteDetailTitle: null }

describe('getViewTitle', () => {
  it('notes と n: を返す', () => {
    expect(getViewTitle('notes', emptyOpts)).toBe('メモ帳')
    expect(getViewTitle('n:x', { ...emptyOpts, noteDetailTitle: 'A' })).toBe('A')
    expect(getViewTitle('n:x', emptyOpts)).toBe('メモ')
  })
  it('プロジェクト・クライアント名を返す', () => {
    expect(
      getViewTitle('p:p1', {
        projects: [{ id: 'p1', name: 'P1', color: '#000', icon: '📁', endDate: '', sortOrder: 0 }],
        clients: [],
        noteDetailTitle: null,
      })
    ).toBe('P1')
    expect(
      getViewTitle('c:c1', {
        projects: [],
        clients: [{ id: 'c1', name: 'C1', color: '#000', icon: '🤝' }],
        noteDetailTitle: null,
      })
    ).toBe('C1')
  })
})
