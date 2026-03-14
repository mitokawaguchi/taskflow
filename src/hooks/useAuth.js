import { useState, useEffect } from 'react'
import { getAuthSession, subscribeAuth } from '../api'

/** 認証状態（authUser, authReady）と購読を集約。ARCH-003 */
export function useAuth() {
  const [authUser, setAuthUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    getAuthSession()
      .then((session) => {
        if (!cancelled) {
          setAuthUser(session?.user ?? null)
          setAuthReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthUser(null)
          setAuthReady(true)
        }
      })
    const unsub = subscribeAuth((session) => setAuthUser(session?.user ?? null))
    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  return { authUser, setAuthUser, authReady }
}
