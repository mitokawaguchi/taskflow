import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

function renderApp() {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

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
    renderApp()
    await waitFor(() => {
      expect(screen.getByText(/件のタスク/)).toBeInTheDocument()
    })
  })

  it('shows sidebar with プロジェクト', async () => {
    renderApp()
    await waitFor(() => {
      expect(screen.getAllByText('プロジェクト').length).toBeGreaterThan(0)
    })
  })

  it('shows すべてのタスク in menu', async () => {
    renderApp()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /すべてのタスク/ })).toBeInTheDocument()
    })
  })

  it('when not authenticated, shows login screen (TEST-003)', async () => {
    const api = await import('./api')
    api.getAuthSession.mockResolvedValueOnce(null)
    renderApp()
    await waitFor(() => {
      expect(screen.getByText(/ログインしてタスクを管理/)).toBeInTheDocument()
    })
  })
})
