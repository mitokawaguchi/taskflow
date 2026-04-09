import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProjectForm from './ProjectForm'

describe('ProjectForm', () => {
  it('renders new project title when no project', () => {
    render(<ProjectForm onSave={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('新しいプロジェクト')).toBeInTheDocument()
  })

  it('renders edit title when project provided', () => {
    render(
      <ProjectForm
        project={{ id: 'p1', name: 'P1', purpose: '目的', icon: '📁', color: '#333', endDate: '' }}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText('プロジェクトを編集')).toBeInTheDocument()
  })

  it('calls onNotifyValidation when 作成 clicked without purpose', () => {
    const onNotifyValidation = vi.fn()
    render(
      <ProjectForm onSave={vi.fn()} onClose={vi.fn()} onNotifyValidation={onNotifyValidation} />
    )
    fireEvent.change(screen.getByPlaceholderText('プロジェクト名'), { target: { value: '名前' } })
    fireEvent.click(screen.getByRole('button', { name: '作成' }))
    expect(onNotifyValidation).toHaveBeenCalledWith('目的は必須です')
  })
})
