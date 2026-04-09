import type { NavigateFunction } from 'react-router-dom'

/** pathname から App の論理 view キーへ（useAppHandlers と同一ルール） */
export function getViewFromPathname(pathname: string): string {
  if (pathname === '/') return 'projects'
  if (pathname === '/all' || pathname === '/tasks') return 'all'
  if (pathname === '/today') return 'today'
  if (pathname === '/overdue') return 'overdue'
  if (pathname === '/kanban') return 'kanban'
  if (pathname === '/dashboard') return 'dashboard'
  if (pathname === '/gantt') return 'gantt'
  if (pathname === '/templates') return 'templates'
  if (pathname === '/clients') return 'clients'
  if (pathname === '/categories') return 'categories'
  if (pathname === '/boss-feedback') return 'boss-feedback'
  if (pathname === '/mail-tracker') return 'mail-tracker'
  if (pathname === '/materials' || pathname.startsWith('/materials/')) return 'materials'
  const pMatch = pathname.match(/^\/projects\/([^/]+)/)
  if (pMatch) return `p:${pMatch[1]}`
  const cMatch = pathname.match(/^\/clients\/([^/]+)/)
  if (cMatch) return `c:${cMatch[1]}`
  return 'projects'
}

/** 論理 view を React Router のパスへ */
export function navigateToView(navigate: NavigateFunction, v: string): void {
  if (v === 'projects') navigate('/')
  else if (v === 'all') navigate('/all')
  else if (v === 'today') navigate('/today')
  else if (v === 'overdue') navigate('/overdue')
  else if (v === 'kanban') navigate('/kanban')
  else if (v === 'dashboard') navigate('/dashboard')
  else if (v === 'gantt') navigate('/gantt')
  else if (v === 'templates') navigate('/templates')
  else if (v === 'clients') navigate('/clients')
  else if (v === 'categories') navigate('/categories')
  else if (v === 'boss-feedback') navigate('/boss-feedback')
  else if (v === 'mail-tracker') navigate('/mail-tracker')
  else if (v === 'materials') navigate('/materials')
  else if (v.startsWith('p:')) navigate(`/projects/${v.slice(2)}`)
  else if (v.startsWith('c:')) navigate(`/clients/${v.slice(2)}`)
  else navigate('/')
}
