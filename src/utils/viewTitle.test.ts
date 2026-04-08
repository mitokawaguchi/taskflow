import { describe, it, expect } from 'vitest'
import { getViewTitle } from './viewTitle'

/** 空配列だけの opts（未解決 ID の挙動用） */
const emptyOpts = { projects: [], clients: [] }

describe('getViewTitle', () => {
  it('プロジェクト・クライアント名を返す', () => {
    expect(
      getViewTitle('p:p1', {
        projects: [{ id: 'p1', name: 'P1', purpose: '目的', color: '#000', icon: '📁', endDate: '', sortOrder: 0 }],
        clients: [],
      })
    ).toBe('P1')
    expect(
      getViewTitle('c:c1', {
        projects: [],
        clients: [{ id: 'c1', name: 'C1', color: '#000', icon: '🤝' }],
      })
    ).toBe('C1')
  })

  it('ID が一致しないときプロジェクト名は空・クライアントはフォールバック文言', () => {
    expect(getViewTitle('p:missing', emptyOpts)).toBe('')
    expect(getViewTitle('c:missing', emptyOpts)).toBe('クライアント')
  })
})
