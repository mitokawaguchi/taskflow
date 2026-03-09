import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

vi.mock('./api', () => ({
  fetchProjects: vi.fn(() => Promise.resolve([])),
  fetchTasks: vi.fn(() => Promise.resolve([])),
  fetchTemplates: vi.fn(() => Promise.resolve([])),
  fetchRemember: vi.fn(() => Promise.resolve([])),
  fetchClients: vi.fn(() => Promise.resolve([])),
  fetchCategories: vi.fn(() => Promise.resolve([])),
  fetchUsers: vi.fn(() => Promise.resolve([])),
  getAuthSession: vi.fn(() =>
    Promise.resolve({ user: { id: 'test-user' } })
  ),
  subscribeAuth: vi.fn(() => () => {}),
  insertProject: vi.fn(),
  insertTask: vi.fn(),
  updateTask: vi.fn(),
  insertTemplate: vi.fn(),
}))

describe('App', () => {
  beforeEach(async () => {
    const api = await import('./api')
    api.fetchProjects.mockResolvedValue([])
    api.fetchTasks.mockResolvedValue([])
    api.fetchTemplates.mockResolvedValue([])
  })

  it('shows loading then main UI', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByText(/件のタスク/)).toBeInTheDocument()
    })
  })

  it('shows sidebar with プロジェクト', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getAllByText('プロジェクト').length).toBeGreaterThan(0)
    })
  })

  it('shows すべてのタスク in menu', async () => {
    render(<App />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /すべてのタスク/ })).toBeInTheDocument()
    })
  })
})
