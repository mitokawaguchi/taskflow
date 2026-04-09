import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TaskForm from './TaskForm'

const defaultProjects = [
  { id: 'p1', name: 'プロジェクト1', purpose: '目的', color: '#06d6a0', icon: '📁' },
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

  it('shows validation toast callback when save clicked without title', () => {
    const onNotifyValidation = vi.fn()
    render(
      <TaskForm
        task={null}
        projects={defaultProjects}
        templates={[]}
        onSave={vi.fn()}
        onClose={vi.fn()}
        onNotifyValidation={onNotifyValidation}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(onNotifyValidation).toHaveBeenCalledWith('タスク名を入力してください')
  })

  it('shows validation when purpose empty but title filled', () => {
    const onNotifyValidation = vi.fn()
    render(
      <TaskForm
        task={null}
        projects={defaultProjects}
        templates={[]}
        onSave={vi.fn()}
        onClose={vi.fn()}
        onNotifyValidation={onNotifyValidation}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('タスク名を入力...'), {
      target: { value: 'タイトルのみ' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(onNotifyValidation).toHaveBeenCalledWith('目的は必須です')
  })

  it('calls onSave with form when required fields and dates filled (new task)', () => {
    const onSave = vi.fn()
    render(
      <TaskForm
        task={{ projectId: 'p1', startDate: '2026-04-01', due: '2026-04-10' }}
        projects={defaultProjects}
        templates={[]}
        onSave={onSave}
        onClose={vi.fn()}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('タスク名を入力...'), {
      target: { value: '新規タスク' },
    })
    fireEvent.change(screen.getByPlaceholderText('このタスクの目的を入力...'), {
      target: { value: '目的テスト' },
    })
    fireEvent.click(screen.getByRole('button', { name: '保存' }))
    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave.mock.calls[0][0].title).toBe('新規タスク')
    expect(onSave.mock.calls[0][0].purpose).toBe('目的テスト')
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
