import { describe, it, expect } from 'vitest'
import {
  PRIORITY,
  SORT_OPTIONS,
  priorityOrder,
  DEFAULT_PROJECTS,
  DEFAULT_TASKS,
  VALIDATION,
  truncateToMax,
} from './constants'

describe('constants', () => {
  describe('PRIORITY', () => {
    it('has critical, high, medium, low', () => {
      expect(Object.keys(PRIORITY)).toEqual(['critical', 'high', 'medium', 'low'])
    })
    it('each has label and color', () => {
      for (const v of Object.values(PRIORITY)) {
        expect(v).toHaveProperty('label')
        expect(v).toHaveProperty('color')
        expect(typeof v.label).toBe('string')
        expect(v.color).toMatch(/^#[0-9a-fA-F]+$/)
      }
    })
  })

  describe('SORT_OPTIONS', () => {
    it('has 4 options with key and label', () => {
      expect(SORT_OPTIONS).toHaveLength(4)
      SORT_OPTIONS.forEach((opt) => {
        expect(opt).toHaveProperty('key')
        expect(opt).toHaveProperty('label')
      })
    })
  })

  describe('priorityOrder', () => {
    it('critical is 0, low is 3', () => {
      expect(priorityOrder.critical).toBe(0)
      expect(priorityOrder.low).toBe(3)
    })
  })

  describe('DEFAULT_PROJECTS', () => {
    it('each has id, name, color, icon', () => {
      expect(DEFAULT_PROJECTS.length).toBeGreaterThan(0)
      DEFAULT_PROJECTS.forEach((p) => {
        expect(p).toHaveProperty('id')
        expect(p).toHaveProperty('name')
        expect(p).toHaveProperty('color')
        expect(p).toHaveProperty('icon')
      })
    })
  })

  describe('DEFAULT_TASKS', () => {
    it('each has id, title, priority, projectId, due, done, created', () => {
      expect(DEFAULT_TASKS.length).toBeGreaterThan(0)
      DEFAULT_TASKS.forEach((t) => {
        expect(t).toHaveProperty('id')
        expect(t).toHaveProperty('title')
        expect(t).toHaveProperty('priority')
        expect(t).toHaveProperty('projectId')
        expect(t).toHaveProperty('due')
        expect(t).toHaveProperty('done')
        expect(t).toHaveProperty('created')
      })
    })
    it('priority is one of PRIORITY keys', () => {
      DEFAULT_TASKS.forEach((t) => {
        expect(PRIORITY[t.priority]).toBeDefined()
      })
    })
    it('projectId references DEFAULT_PROJECTS', () => {
      const ids = new Set(DEFAULT_PROJECTS.map((p) => p.id))
      DEFAULT_TASKS.forEach((t) => {
        expect(ids.has(t.projectId)).toBe(true)
      })
    })
  })

  describe('VALIDATION', () => {
    it('has max lengths for taskTitle, taskDesc, projectName, templateTitle, templateDesc, clientName, rememberBody', () => {
      expect(VALIDATION.taskTitle).toBe(500)
      expect(VALIDATION.taskDesc).toBe(2000)
      expect(VALIDATION.projectName).toBe(200)
      expect(VALIDATION.templateTitle).toBe(200)
      expect(VALIDATION.templateDesc).toBe(2000)
      expect(VALIDATION.clientName).toBe(200)
      expect(VALIDATION.rememberBody).toBe(2000)
    })
  })

  describe('truncateToMax', () => {
    it('returns empty string for non-string', () => {
      expect(truncateToMax(null, 10)).toBe('')
      expect(truncateToMax(undefined, 10)).toBe('')
    })
    it('trims and returns as-is when within max', () => {
      expect(truncateToMax('  hello  ', 10)).toBe('hello')
      expect(truncateToMax('hi', 10)).toBe('hi')
    })
    it('trims and truncates when over max', () => {
      expect(truncateToMax('  123456789012  ', 10)).toBe('1234567890')
    })
  })
})
