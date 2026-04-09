/** React Router の pathname から教材 ID を取得（/materials は null） */
export function getMaterialIdFromPath(pathname: string): string | null {
  const normalized = pathname.replace(/\/$/, '') || '/'
  if (normalized === '/materials') return null
  const m = normalized.match(/^\/materials\/([^/]+)$/)
  return m ? m[1] : null
}
