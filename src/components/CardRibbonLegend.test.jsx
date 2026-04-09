import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CardRibbonLegend } from './CardRibbonLegend'

describe('CardRibbonLegend', () => {
  it('状態と重要度の見出しを表示する', () => {
    render(<CardRibbonLegend />)
    expect(screen.getByRole('heading', { name: /タスクカードの「左の帯」と色/ })).toBeInTheDocument()
    expect(screen.getByText('左帯（状態）')).toBeInTheDocument()
    expect(screen.getByText('面・枠（重要度）')).toBeInTheDocument()
    expect(screen.getByText('未着手')).toBeInTheDocument()
    expect(screen.getByText('緊急')).toBeInTheDocument()
  })
})
