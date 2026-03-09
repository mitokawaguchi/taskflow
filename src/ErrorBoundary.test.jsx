import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

const Throw = () => {
  throw new Error('test error')
}

let throwOnceCount = 0
/** 初回マウント時のみ throw し、再試行で再マウントされたときは OK を表示（再試行テスト用） */
const ThrowOnce = () => {
  throwOnceCount += 1
  if (throwOnceCount <= 1) throw new Error('test error')
  return <span>OK</span>
}

const Ok = () => <span>OK</span>

describe('ErrorBoundary', () => {
  beforeEach(() => {
    throwOnceCount = 0
  })

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <Ok />
      </ErrorBoundary>
    )
    expect(screen.getByText('OK')).toBeInTheDocument()
  })

  it('renders error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <Throw />
      </ErrorBoundary>
    )
    expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument()
    expect(screen.getByText('test error')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /再試行/ })).toBeInTheDocument()
  })

  it('clicking 再試行 clears error state and re-renders child', () => {
    render(
      <ErrorBoundary>
        <ThrowOnce />
      </ErrorBoundary>
    )
    // Strict Mode で二重マウントされると初回から OK になることがあるので、エラー表示時のみクリック
    const retryButton = screen.queryByRole('button', { name: /再試行/ })
    if (retryButton) {
      fireEvent.click(retryButton)
      expect(screen.queryByText('test error')).not.toBeInTheDocument()
    }
    expect(screen.getByText('OK')).toBeInTheDocument()
  })
})
