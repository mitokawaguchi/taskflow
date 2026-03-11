import { describe, it, expect } from 'vitest'
import { LEGAL_PAGES, getLegalPageFromHash } from './legalContent'

describe('legalContent', () => {
  describe('LEGAL_PAGES', () => {
    it('has terms, privacy, disclaimer keys', () => {
      expect(LEGAL_PAGES).toHaveProperty('terms')
      expect(LEGAL_PAGES).toHaveProperty('privacy')
      expect(LEGAL_PAGES).toHaveProperty('disclaimer')
    })
    it('terms has title and sections', () => {
      expect(LEGAL_PAGES.terms.title).toBe('利用規約')
      expect(Array.isArray(LEGAL_PAGES.terms.sections)).toBe(true)
      expect(LEGAL_PAGES.terms.sections[0]).toHaveProperty('heading')
      expect(LEGAL_PAGES.terms.sections[0]).toHaveProperty('paragraphs')
    })
  })

  describe('getLegalPageFromHash', () => {
    it('returns null when hash is empty or unknown', () => {
      expect(getLegalPageFromHash()).toBe(null)
    })
  })
})
