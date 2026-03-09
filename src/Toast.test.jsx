import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Toast from './Toast'

describe('Toast', () => {
  it('renders nothing when toasts empty', () => {
    const { container } = render(<Toast toasts={[]} />)
    expect(container.querySelector('.toast')).not.toBeInTheDocument()
  })

  it('renders toast title and message', () => {
    render(
      <Toast
        toasts={[{ id: '1', icon: '✅', title: '保存しました', msg: 'タスクを更新しました' }]}
      />
    )
    expect(screen.getByText('保存しました')).toBeInTheDocument()
    expect(screen.getByText('タスクを更新しました')).toBeInTheDocument()
  })
})
