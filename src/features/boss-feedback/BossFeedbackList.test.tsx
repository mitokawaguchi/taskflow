import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { BossFeedbackList } from './BossFeedbackList'
import {
  filterBossFeedbackByCategory,
  filterBossFeedbackByDescription,
  sortBossFeedbackByFrequency,
} from './bossFeedbackFilters'
import type { BossFeedback } from './types'

const sample: BossFeedback[] = [
  {
    id: '1',
    createdAt: '2025-03-01T00:00:00Z',
    category: '誤字',
    description: '見出しの誤字',
    exampleBefore: 'a',
    exampleAfter: 'b',
    projectName: 'PJ1',
    frequency: 5,
    memo: null,
  },
  {
    id: '2',
    createdAt: '2025-03-02T00:00:00Z',
    category: '表現',
    description: '冗長な表現',
    exampleBefore: null,
    exampleAfter: null,
    projectName: null,
    frequency: 2,
    memo: 'メモ',
  },
]

describe('bossFeedbackFilters', () => {
  it('カテゴリ「すべて」は全件通す', () => {
    expect(filterBossFeedbackByCategory(sample, 'all')).toHaveLength(2)
  })
  it('カテゴリで絞り込む（境界: 一致のみ）', () => {
    const r = filterBossFeedbackByCategory(sample, '誤字')
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe('1')
  })
  it('説明検索は部分一致・大文字小文字無視', () => {
    const r = filterBossFeedbackByDescription(sample, '冗長')
    expect(r).toHaveLength(1)
    expect(r[0].id).toBe('2')
  })
  it('frequency 降順・昇順', () => {
    const desc = sortBossFeedbackByFrequency(sample, true)
    expect(desc[0].frequency).toBe(5)
    const asc = sortBossFeedbackByFrequency(sample, false)
    expect(asc[0].frequency).toBe(2)
  })
})

describe('BossFeedbackList', () => {
  it('空のときメッセージを表示', () => {
    render(
      <BossFeedbackList
        loading={false}
        items={[]}
        filters={{ category: 'all', sortFrequencyDesc: true, searchQuery: '' }}
        onFiltersChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.queryByText(/該当する指摘がありません/)).not.toBeNull()
  })

  it('行に編集・削除がある', () => {
    render(
      <BossFeedbackList
        loading={false}
        items={sample}
        filters={{ category: 'all', sortFrequencyDesc: true, searchQuery: '' }}
        onFiltersChange={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    const rows = screen.getAllByRole('row')
    expect(rows.length).toBeGreaterThan(1)
    expect(within(rows[1]).queryByRole('button', { name: '編集' })).not.toBeNull()
    expect(within(rows[1]).queryByRole('button', { name: '削除' })).not.toBeNull()
  })
})
