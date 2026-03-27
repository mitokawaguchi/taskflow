import { describe, it, expect } from 'vitest'
import { getViewTitle } from './viewTitle'

const emptyOpts = { projects: [], clients: [] }

describe('getViewTitle', () => {
  it('プロジェクト・クライアント名を返す', () => {
    expect(
      getViewTitle('p:p1', {
        projects: [{ id: 'p1', name: 'P1', color: '#000', icon: '📁', endDate: '', sortOrder: 0 }],
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
})
