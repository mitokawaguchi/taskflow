import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { parseHexColor, applyAccentToDocument, ACCENT_STORAGE_KEY } from './accentColor'

describe('parseHexColor', () => {
  it('parses #RRGGBB', () => {
    expect(parseHexColor('#5e6ad2')).toEqual({ r: 94, g: 106, b: 210 })
  })
  it('parses RRGGBB without hash', () => {
    expect(parseHexColor('3a8f52')).toEqual({ r: 58, g: 143, b: 82 })
  })
  it('returns null for invalid', () => {
    expect(parseHexColor('#fff')).toBeNull()
    expect(parseHexColor('')).toBeNull()
  })
})

describe('applyAccentToDocument', () => {
  beforeEach(() => {
    document.documentElement.style.removeProperty('--accent')
    document.documentElement.style.removeProperty('--accent-hover')
    document.documentElement.style.removeProperty('--accent-rgb')
    document.documentElement.style.removeProperty('--accent-hover-rgb')
    document.documentElement.style.removeProperty('--accent-glow')
  })

  afterEach(() => {
    document.documentElement.style.removeProperty('--accent')
    document.documentElement.style.removeProperty('--accent-hover')
    document.documentElement.style.removeProperty('--accent-rgb')
    document.documentElement.style.removeProperty('--accent-hover-rgb')
    document.documentElement.style.removeProperty('--accent-glow')
  })

  it('sets variables for light theme', () => {
    applyAccentToDocument('#5e6ad2', 'light')
    expect(document.documentElement.style.getPropertyValue('--accent').trim()).toBe('#5e6ad2')
    expect(document.documentElement.style.getPropertyValue('--accent-rgb').trim()).toBe('94, 106, 210')
  })

  it('clears when null', () => {
    applyAccentToDocument('#5e6ad2', 'light')
    applyAccentToDocument(null, 'light')
    expect(document.documentElement.style.getPropertyValue('--accent')).toBe('')
  })
})

describe('ACCENT_STORAGE_KEY', () => {
  it('is stable', () => {
    expect(ACCENT_STORAGE_KEY).toBe('taskflow_accent_hex')
  })
})
