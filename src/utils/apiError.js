/**
 * API エラーを区分し、Toast メッセージやリトライ方針に使う。ロードマップ: エラーハンドリング 9。
 * @param {Error} e
 * @returns {'network'|'auth'|'4xx'|'5xx'|'unknown'}
 */
export function classifyApiError(e) {
  if (!e || typeof e.message !== 'string') return 'unknown'
  const msg = e.message.toLowerCase()
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) return 'network'
  if (msg.includes('auth') || msg.includes('session') || msg.includes('jwt') || msg.includes('unauthorized')) return 'auth'
  if (e.status === 400 || e.status === 401 || e.status === 403 || e.status === 404) return '4xx'
  if (e.status >= 500) return '5xx'
  if (msg.includes('400') || msg.includes('401') || msg.includes('403') || msg.includes('404')) return '4xx'
  if (msg.includes('500') || msg.includes('502') || msg.includes('503')) return '5xx'
  return 'unknown'
}
