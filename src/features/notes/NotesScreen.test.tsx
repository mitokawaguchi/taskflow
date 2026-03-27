import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import NotesScreen from './NotesScreen'

const fetchNotes = vi.fn(() => Promise.resolve([]))
const insertNote = vi.fn()
const deleteNote = vi.fn()

vi.mock('../../api/notes', () => ({
  fetchNotes: (...args: unknown[]) => fetchNotes(...args),
  insertNote: (...args: unknown[]) => insertNote(...args),
  deleteNote: (...args: unknown[]) => deleteNote(...args),
}))

describe('NotesScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchNotes.mockResolvedValue([])
  })

  it('空のとき案内文を表示する', async () => {
    render(<NotesScreen setView={vi.fn()} addToast={vi.fn()} />)
    expect(await screen.findByText(/メモはまだありません/)).toBeInTheDocument()
  })

  it('メモ一覧を表示する', async () => {
    fetchNotes.mockResolvedValueOnce([
      {
        id: 'n1',
        title: 'テスト',
        snapshot: null,
        updatedAt: '2025-01-01T00:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
      },
    ])
    render(<NotesScreen setView={vi.fn()} addToast={vi.fn()} />)
    expect(await screen.findByText('テスト')).toBeInTheDocument()
  })
})
