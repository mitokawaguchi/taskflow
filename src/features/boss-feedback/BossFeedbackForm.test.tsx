import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BossFeedbackForm } from './BossFeedbackForm'
import { validateBossFeedbackForm } from './validation'
import type { BossFeedbackFormValues } from './types'

const base: BossFeedbackFormValues = {
  category: 'その他',
  description: '内容',
  purpose: '再発防止のため',
  exampleBefore: '',
  exampleAfter: '',
  projectName: '',
  frequency: 1,
  memo: '',
}

describe('validateBossFeedbackForm', () => {
  it('正常系: description があり frequency が 1 以上の整数', () => {
    const r = validateBossFeedbackForm(base)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.values.description).toBe('内容')
  })
  it('異常系: description が空', () => {
    const r = validateBossFeedbackForm({ ...base, description: '   ' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.error).toMatch(/必須/)
  })
  it('異常系: purpose が空', () => {
    const r = validateBossFeedbackForm({ ...base, purpose: '   ' })
    expect(r.ok).toBe(false)
  })
  it('境界値: frequency が 0', () => {
    const r = validateBossFeedbackForm({ ...base, frequency: 0 })
    expect(r.ok).toBe(false)
  })
})

describe('BossFeedbackForm', () => {
  it('保存ボタンで onSubmit が呼ばれる', () => {
    const onSubmit = vi.fn()
    render(
      <BossFeedbackForm
        form={base}
        editingId={null}
        onFieldChange={vi.fn()}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
