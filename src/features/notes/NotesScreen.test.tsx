import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { fetchNotes } from '../../api/notes'
import type { Note } from '../../types'
import NotesScreen from './NotesScreen'

vi.mock('../../api/notes', () => ({
  fetchNotes: vi.fn(() => Promise.resolve([])),
  insertNote: vi.fn(),
  deleteNote: vi.fn(),
}))

describe('NotesScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchNotes).mockResolvedValue([])
  })

  it('空のとき案内文を表示する', async () => {
    render(<NotesScreen setView={vi.fn()} addToast={vi.fn()} />)
    expect(await screen.findByText(/メモはまだありません/)).toBeInTheDocument()
  })

  it('メモ一覧を表示する', async () => {
    const row: Note = {
      id: 'n1',
      title: 'テスト',
      bodyText: '',
      snapshot: null,
      updatedAt: '2025-01-01T00:00:00.000Z',
      createdAt: '2025-01-01T00:00:00.000Z',
    }
    vi.mocked(fetchNotes).mockResolvedValueOnce([row])
    render(<NotesScreen setView={vi.fn()} addToast={vi.fn()} />)
    expect(await screen.findByText('テスト')).toBeInTheDocument()
  })
})
