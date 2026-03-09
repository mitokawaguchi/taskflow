import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import CalendarPicker from './CalendarPicker'

describe('CalendarPicker', () => {
  it('renders calendar with today button', () => {
    render(<CalendarPicker value="" onChange={vi.fn()} />)
    expect(screen.getByText('今日')).toBeInTheDocument()
  })

  it('renders weekday headers', () => {
    render(<CalendarPicker value="" onChange={vi.fn()} />)
    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
  })

  it('has accessible label', () => {
    render(<CalendarPicker value="" onChange={vi.fn()} />)
    expect(screen.getByRole('application', { name: /期限日を選択/ })).toBeInTheDocument()
  })
})
