import { describe, it, expect } from 'vitest'
import { getTaskFormValidationMessage } from './taskFormSubmit'

const base = {
  title: 't',
  purpose: 'p',
  startDate: '2026-04-01',
  due: '2026-04-10',
  desc: '',
  hypothesis: '',
  timeboxMinutes: null,
  premortemRisks: [],
}

describe('getTaskFormValidationMessage', () => {
  it('returns message when title empty', () => {
    expect(getTaskFormValidationMessage({ ...base, title: '  ' }, false)).toBe('タスク名を入力してください')
  })

  it('returns message when purpose empty', () => {
    expect(getTaskFormValidationMessage({ ...base, purpose: '' }, false)).toBe('目的は必須です')
  })

  it('returns message when new task missing dates', () => {
    expect(
      getTaskFormValidationMessage({ ...base, startDate: '', due: '2026-04-10' }, false)
    ).toBe('開始日と期限を入力してください')
  })

  it('returns null when new task valid', () => {
    expect(getTaskFormValidationMessage(base, false)).toBeNull()
  })

  it('skips date check when editing existing', () => {
    expect(
      getTaskFormValidationMessage({ ...base, startDate: '', due: '' }, true)
    ).toBeNull()
  })
})
