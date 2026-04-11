import { describe, it, expect } from 'vitest'
import { applyDailyPlannerRollover } from './applyDailyPlannerRollover'

describe('applyDailyPlannerRollover', () => {
  it('anchor 未設定時は日付だけ記録し並びは維持', () => {
    const r = applyDailyPlannerRollover(
      { todayTaskIds: ['a'], tomorrowTaskIds: ['b'], plannerAnchorYmd: null },
      '2026-04-10'
    )
    expect(r.didRollover).toBe(false)
    expect(r.next.plannerAnchorYmd).toBe('2026-04-10')
    expect(r.next.todayTaskIds).toEqual(['a'])
    expect(r.next.tomorrowTaskIds).toEqual(['b'])
  })

  it('基準日が古いとき明日→今日へ繰り越し', () => {
    const r = applyDailyPlannerRollover(
      { todayTaskIds: ['a'], tomorrowTaskIds: ['b', 'c'], plannerAnchorYmd: '2026-04-09' },
      '2026-04-10'
    )
    expect(r.didRollover).toBe(true)
    expect(r.next.todayTaskIds).toEqual(['b', 'c'])
    expect(r.next.tomorrowTaskIds).toEqual([])
    expect(r.next.plannerAnchorYmd).toBe('2026-04-10')
  })

  it('基準日が有効日と一致なら変更なし', () => {
    const s = { todayTaskIds: ['a'], tomorrowTaskIds: ['b'], plannerAnchorYmd: '2026-04-10' as const }
    const r = applyDailyPlannerRollover(s, '2026-04-10')
    expect(r.didRollover).toBe(false)
    expect(r.next).toBe(s)
  })
})
