import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { load, save, today, isToday, isOverdue, formatDate } from './utils'

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
