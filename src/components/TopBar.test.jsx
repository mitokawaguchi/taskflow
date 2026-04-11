import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import TopBar from './TopBar'

const baseProps = {
  view: 'all',
  isProjectView: false,
  setView: vi.fn(),
  viewTitle: () => 'すべてのタスク',
  viewTabs: [
    { key: 'kanban', label: 'カンバン', icon: 'kanban' },
    { key: 'gantt', label: 'タイムライン', icon: 'gantt' },
    { key: 'dashboard', label: 'インサイト', icon: 'dashboard' },
  ],
  isMainView: true,
  theme: 'light',
  setTheme: vi.fn(),
  setSidebarOpen: vi.fn(),
  setFilterOpen: vi.fn(),
  activeFilterCount: 0,
  searchQuery: '',
  setSearchQuery: vi.fn(),
  todayCount: 0,
  overdueCount: 0,
  onShowMorning: vi.fn(),
  onShowProfile: vi.fn(),
  showDone: false,
  setShowDone: vi.fn(),
  onAddTask: vi.fn(),
}

describe('TopBar', () => {
  it('renders title', () => {
    render(<TopBar {...baseProps} />)
    expect(screen.getByText('すべてのタスク')).toBeInTheDocument()
  })

  it('renders profile button in primary row (topbar-right)', () => {
    render(<TopBar {...baseProps} />)
    const profileBtn = screen.getByRole('button', { name: 'プロフィール・設定' })
    expect(profileBtn).toBeInTheDocument()
    expect(profileBtn.closest('.topbar-right')).toBeTruthy()
  })

  it('renders add button in primary row (topbar-right)', () => {
    render(<TopBar {...baseProps} />)
    const addBtn = screen.getByRole('button', { name: /追加/ })
    expect(addBtn).toBeInTheDocument()
    expect(addBtn.closest('.topbar-right')).toBeTruthy()
  })

  it('renders notification bell in primary row', () => {
    render(<TopBar {...baseProps} />)
    const bellBtn = screen.getByRole('button', { name: '通知' })
    expect(bellBtn).toBeInTheDocument()
    expect(bellBtn.closest('.topbar-right')).toBeTruthy()
  })

  it('renders theme toggle in secondary row', () => {
    render(<TopBar {...baseProps} />)
    const themeSwitch = screen.getByRole('button', { name: /ライトモード/ })
    expect(themeSwitch).toBeInTheDocument()
    expect(themeSwitch.closest('.topbar-secondary')).toBeTruthy()
  })

  it('renders filter and search in secondary row on list views', () => {
    render(<TopBar {...baseProps} view="all" />)
    const filterBtn = screen.getByRole('button', { name: 'フィルター' })
    expect(filterBtn.closest('.topbar-secondary')).toBeTruthy()
    expect(screen.getByRole('searchbox', { name: 'タスクを検索' })).toBeInTheDocument()
  })

  it('hides filter and search on non-list views', () => {
    render(<TopBar {...baseProps} view="kanban" />)
    expect(screen.queryByRole('button', { name: 'フィルター' })).toBeNull()
    expect(screen.queryByRole('searchbox')).toBeNull()
  })

  it('calls onShowProfile when profile button is clicked', () => {
    const onShowProfile = vi.fn()
    render(<TopBar {...baseProps} onShowProfile={onShowProfile} />)
    fireEvent.click(screen.getByRole('button', { name: 'プロフィール・設定' }))
    expect(onShowProfile).toHaveBeenCalledOnce()
  })

  it('calls onAddTask when add button is clicked', () => {
    const onAddTask = vi.fn()
    render(<TopBar {...baseProps} onAddTask={onAddTask} />)
    fireEvent.click(screen.getByRole('button', { name: /追加/ }))
    expect(onAddTask).toHaveBeenCalledOnce()
  })

  it('calls onShowMorning when notification button is clicked', () => {
    const onShowMorning = vi.fn()
    render(<TopBar {...baseProps} onShowMorning={onShowMorning} />)
    fireEvent.click(screen.getByRole('button', { name: '通知' }))
    expect(onShowMorning).toHaveBeenCalledOnce()
  })

  it('hides profile, bell, and add on clients view', () => {
    render(<TopBar {...baseProps} view="clients" />)
    expect(screen.queryByRole('button', { name: 'プロフィール・設定' })).toBeNull()
    expect(screen.queryByRole('button', { name: '通知' })).toBeNull()
    expect(screen.queryByRole('button', { name: /追加/ })).toBeNull()
  })

  it('shows notification dot when todayCount > 0', () => {
    const { container } = render(<TopBar {...baseProps} todayCount={3} />)
    expect(container.querySelector('.topbar-icon-dot')).toBeTruthy()
  })

  it('shows back button on project detail view', () => {
    render(<TopBar {...baseProps} view="p:abc" isProjectView />)
    expect(screen.getByRole('button', { name: '一覧に戻る' })).toBeInTheDocument()
  })

  it('renders view tabs when isMainView is true', () => {
    render(<TopBar {...baseProps} isMainView />)
    expect(screen.getByRole('tab', { name: /カンバン/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /タイムライン/ })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /インサイト/ })).toBeInTheDocument()
  })

  it('renders showDone toggle in secondary row', () => {
    render(<TopBar {...baseProps} />)
    const btn = screen.getByRole('button', { name: /完了を表示/ })
    expect(btn.closest('.topbar-secondary')).toBeTruthy()
  })
})
