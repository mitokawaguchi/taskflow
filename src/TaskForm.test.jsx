import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskForm from './TaskForm'

const defaultProjects = [
  { id: 'p1', name: 'プロジェクト1', color: '#06d6a0', icon: '📁' },
]

describe('TaskForm', () => {
  it('shows 新しいタスク when no task', () => {
    render(
      <TaskForm
        task={null}
        projects={defaultProjects}
        templates={[]}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText('新しいタスク')).toBeInTheDocument()
  })

  it('shows タスクを編集 when editing', () => {
    render(
      <TaskForm
        task={{ id: 't1', title: '既存' }}
        projects={defaultProjects}
        templates={[]}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText('タスクを編集')).toBeInTheDocument()
  })

  it('save button is disabled when title is empty', () => {
    render(
      <TaskForm
        task={null}
        projects={defaultProjects}
        templates={[]}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    )
    const saveBtn = screen.getByRole('button', { name: '保存' })
    expect(saveBtn).toBeDisabled()
  })

  it('calls onSave with form when title filled and save clicked', () => {
    const onSave = vi.fn()
    render(
      <TaskForm
        task={null}
        projects={defaultProjects}
        templates={[]}
        onSave={onSave}
        onClose={vi.fn()}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('タスク名を入力...'), {
      target: { value: '新規タスク' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave.mock.calls[0][0].title).toBe('新規タスク')
  })

  it('calls onClose when 戻る is clicked', () => {
    const onClose = vi.fn()
    render(
      <TaskForm
        task={null}
        projects={defaultProjects}
        templates={[]}
        onSave={vi.fn()}
        onClose={onClose}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: '戻る' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when キャンセル is clicked', () => {
    const onClose = vi.fn()
    render(
      <TaskForm
        task={null}
        projects={defaultProjects}
        templates={[]}
        onSave={vi.fn()}
        onClose={onClose}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows template buttons when templates provided and new task', () => {
    render(
      <TaskForm
        task={null}
        projects={defaultProjects}
        templates={[{ id: 'tpl1', title: 'テンプレA', desc: '', priority: 'medium' }]}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText('テンプレートから')).toBeInTheDocument()
    expect(screen.getByText('テンプレA')).toBeInTheDocument()
  })

  it('applies template when template button clicked', () => {
    render(
      <TaskForm
        task={null}
        projects={defaultProjects}
        templates={[{ id: 'tpl1', title: 'テンプレA', desc: 'd', priority: 'high' }]}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('テンプレA'))
    expect(screen.getByDisplayValue('テンプレA')).toBeInTheDocument()
  })
})
