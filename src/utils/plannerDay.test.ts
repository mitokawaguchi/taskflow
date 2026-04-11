import { describe, it, expect, afterEach, vi } from 'vitest'
import { getEffectivePlannerYmd } from './plannerDay'

describe('getEffectivePlannerYmd', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('JST で 02:59 は前日扱い', () => {
    vi.setSystemTime(new Date('2026-04-09T17:59:00.000Z'))
    expect(getEffectivePlannerYmd()).toBe('2026-04-09')
  })

  it('JST で 03:00 は当日扱い', () => {
    vi.setSystemTime(new Date('2026-04-09T18:00:00.000Z'))
    expect(getEffectivePlannerYmd()).toBe('2026-04-10')
  })
})
