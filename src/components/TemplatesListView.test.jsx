import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TemplatesListView from './TemplatesListView'

describe('TemplatesListView', () => {
  it('renders empty state when no templates', () => {
    render(
      <TemplatesListView
        templates={[]}
        onAddTemplate={vi.fn()}
        onEditTemplate={vi.fn()}
        onUseTemplate={vi.fn()}
      />
    )
    expect(screen.getByText('テンプレートがありません')).toBeInTheDocument()
    expect(screen.getByText('最初のテンプレートを作成')).toBeInTheDocument()
  })

  it('renders template cards when templates exist', () => {
    const templates = [
      { id: 't1', title: 'テンプレ1', desc: '説明', priority: 'high' },
      { id: 't2', title: 'テンプレ2', desc: '', priority: 'medium' },
    ]
    render(
      <TemplatesListView
        templates={templates}
        onAddTemplate={vi.fn()}
        onEditTemplate={vi.fn()}
        onUseTemplate={vi.fn()}
      />
    )
    expect(screen.getByText('テンプレ1')).toBeInTheDocument()
    expect(screen.getByText('テンプレ2')).toBeInTheDocument()
    expect(screen.getAllByText('編集')).toHaveLength(2)
    expect(screen.getAllByText('このテンプレを使う')).toHaveLength(2)
  })

  it('calls onEditTemplate when 編集 is clicked', () => {
    const onEditTemplate = vi.fn()
    const templates = [{ id: 't1', title: 'T', desc: '', priority: 'medium' }]
    render(
      <TemplatesListView
        templates={templates}
        onAddTemplate={vi.fn()}
        onEditTemplate={onEditTemplate}
        onUseTemplate={vi.fn()}
      />
    )
    const editButtons = screen.getAllByText('編集')
    fireEvent.click(editButtons[0])
    expect(onEditTemplate).toHaveBeenCalledWith(templates[0])
  })
})
