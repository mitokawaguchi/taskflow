import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskPurposePanel } from './TaskPurposePanel'

describe('TaskPurposePanel', () => {
  it('目的が空のときは何も描画しない', () => {
    const { container } = render(<TaskPurposePanel purpose="" />)
    expect(container.firstChild).toBeNull()
  })

  it('目的があるときラベルと本文を表示する', () => {
    render(<TaskPurposePanel purpose="  品質を上げる  " variant="list" />)
    expect(screen.getByText('目的')).toBeInTheDocument()
    expect(screen.getByText('品質を上げる')).toBeInTheDocument()
  })
})
