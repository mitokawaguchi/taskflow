import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ColorSwatchPicker from './ColorSwatchPicker'

describe('ColorSwatchPicker', () => {
  it('renders with aria-label', () => {
    render(<ColorSwatchPicker value="#6b7280" onChange={() => {}} />)
    expect(screen.getByRole('group', { name: '色を選択' })).toBeInTheDocument()
  })

  it('uses custom aria-label when provided', () => {
    render(<ColorSwatchPicker value="#333" onChange={() => {}} ariaLabel="カテゴリ色" />)
    expect(screen.getByRole('group', { name: 'カテゴリ色' })).toBeInTheDocument()
  })

  it('calls onChange when a swatch is clicked', () => {
    const onChange = vi.fn()
    const { container } = render(<ColorSwatchPicker value="#6b7280" onChange={onChange} />)
    const firstSwatch = container.querySelector('.color-swatch')
    if (firstSwatch) {
      fireEvent.click(firstSwatch)
      expect(onChange).toHaveBeenCalled()
    }
  })

  it('toggles カスタム色 panel when button clicked', () => {
    render(<ColorSwatchPicker value="#6b7280" onChange={() => {}} />)
    const btn = screen.getByRole('button', { name: 'カスタム色' })
    fireEvent.click(btn)
    expect(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument()
    expect(screen.getByLabelText('カスタム色')).toBeInTheDocument()
  })
})
