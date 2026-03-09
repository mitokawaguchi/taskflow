import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import TemplateForm from './TemplateForm'

describe('TemplateForm', () => {
  it('renders create title when no template', () => {
    render(<TemplateForm onSave={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('テンプレートを作成')).toBeInTheDocument()
  })

  it('renders edit title when template provided', () => {
    render(
      <TemplateForm
        template={{ id: 'tpl1', title: 'T1', desc: '', priority: 'low' }}
        onSave={vi.fn()}
        onDelete={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(screen.getByText('テンプレートを編集')).toBeInTheDocument()
  })
})
