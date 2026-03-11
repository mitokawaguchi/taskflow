import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  load,
  save,
  today,
  isToday,
  isTomorrow,
  isOverdue,
  formatDate,
  formatDateWithWeekday,
  formatTodayDisplay,
  endDateLabel,
} from './utils'

describe('utils', () => {
  describe('today', () => {
    it('returns YYYY-MM-DD format', () => {
      const t = today()
      expect(t).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe('isToday', () => {
    it('returns true when date equals today', () => {
      expect(isToday(today())).toBe(true)
    })
    it('returns false for other date', () => {
      expect(isToday('2000-01-01')).toBe(false)
    })
  })

  describe('isOverdue', () => {
    it('returns true when date is before today', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-15'))
      expect(isOverdue('2026-03-14')).toBe(true)
      vi.useRealTimers()
    })
    it('returns false when date is today or future', () => {
      expect(isOverdue(today())).toBe(false)
      expect(isOverdue('2099-12-31')).toBe(false)
    })
    it('returns falsy for empty/falsy', () => {
      expect(isOverdue('')).toBeFalsy()
      expect(isOverdue(null)).toBeFalsy()
    })
  })

  describe('formatDate', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-15'))
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns empty string for empty/falsy', () => {
      expect(formatDate('')).toBe('')
      expect(formatDate(null)).toBe('')
    })
    it('returns 今日 when date is today', () => {
      expect(formatDate('2026-03-15')).toBe('今日')
    })
    it('returns 明日 when date is tomorrow', () => {
      expect(formatDate('2026-03-16')).toBe('明日')
    })
    it('returns date and weekday for future', () => {
      expect(formatDate('2026-03-20')).toBe('3/20(金)')
    })
    it('returns date and weekday for past', () => {
      expect(formatDate('2026-03-10')).toBe('3/10(火)')
    })
  })

  describe('isTomorrow', () => {
    it('returns true when date is tomorrow', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-15'))
      expect(isTomorrow('2026-03-16')).toBe(true)
      vi.useRealTimers()
    })
    it('returns false for today or other', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-15'))
      expect(isTomorrow('2026-03-15')).toBe(false)
      expect(isTomorrow('2026-03-17')).toBe(false)
      vi.useRealTimers()
    })
    it('returns false for empty', () => {
      expect(isTomorrow('')).toBe(false)
      expect(isTomorrow(null)).toBe(false)
    })
  })

  describe('formatDateWithWeekday', () => {
    it('returns empty string for empty', () => {
      expect(formatDateWithWeekday('')).toBe('')
      expect(formatDateWithWeekday(null)).toBe('')
    })
    it('returns M/D(曜) format', () => {
      expect(formatDateWithWeekday('2026-03-15')).toBe('3/15(日)')
    })
  })

  describe('formatTodayDisplay', () => {
    it('returns Japanese long date format', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-15'))
      expect(formatTodayDisplay()).toMatch(/2026年3月15日/)
      vi.useRealTimers()
    })
  })

  describe('endDateLabel', () => {
    it('returns empty for empty', () => {
      expect(endDateLabel('')).toBe('')
      expect(endDateLabel(null)).toBe('')
    })
    it('returns 今日まで when endDate is today', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-15'))
      expect(endDateLabel('2026-03-15')).toBe('今日まで')
      vi.useRealTimers()
    })
    it('returns date with weekday for other', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-15'))
      expect(endDateLabel('2026-03-20')).toBe('3/20(金)')
      vi.useRealTimers()
    })
  })

  describe('load / save', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('save stores JSON, load retrieves it', () => {
      save('key1', { a: 1 })
      expect(load('key1', null)).toEqual({ a: 1 })
    })
    it('load returns default when key missing', () => {
      expect(load('missing', [])).toEqual([])
      expect(load('missing', 0)).toBe(0)
    })
    it('load returns default on invalid JSON', () => {
      localStorage.setItem('bad', 'not json')
      expect(load('bad', 'default')).toBe('default')
    })
  })
})
