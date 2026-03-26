import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PublicDemoPage } from './PublicDemoPage'

describe('PublicDemoPage', () => {
  it('説明文と法定リンクを表示する', () => {
    render(<PublicDemoPage />)
    expect(screen.getByText(/公開デモ（閲覧のみ）/)).toBeInTheDocument()
    expect(screen.getByText(/ログイン・新規登録はできません/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '利用規約' })).toBeInTheDocument()
  })

  it('repositoryUrl があるとき GitHub リンクを表示する', () => {
    render(<PublicDemoPage repositoryUrl="https://github.com/example/repo" />)
    expect(screen.getByRole('link', { name: 'ソースコード（GitHub）' })).toHaveAttribute(
      'href',
      'https://github.com/example/repo',
    )
  })
})
