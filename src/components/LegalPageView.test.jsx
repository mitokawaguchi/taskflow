import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LegalPageView from './LegalPageView'

describe('LegalPageView', () => {
  it('returns null when pageKey is invalid', () => {
    const { container } = render(<LegalPageView pageKey="unknown" onBack={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders terms page title and back button', () => {
    const onBack = vi.fn()
    render(<LegalPageView pageKey="terms" onBack={onBack} />)
    expect(screen.getByRole('heading', { name: '利用規約' })).toBeInTheDocument()
    const back = screen.getByRole('button', { name: /戻る/ })
    expect(back).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn()
    render(<LegalPageView pageKey="terms" onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /戻る/ }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})
