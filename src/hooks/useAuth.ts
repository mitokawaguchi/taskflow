import type { User } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { getAuthSession, subscribeAuth } from '../api'
import { getIsPublicDemoMode } from '../config/publicDemoMode'

/** 認証状態（authUser, authReady）と購読を集約。ARCH-003 */
export function useAuth() {
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    if (getIsPublicDemoMode()) {
      setAuthUser(null)
      setAuthReady(true)
      return
    }
    let cancelled = false
    getAuthSession()
      .then((session) => {
        if (!cancelled) {
          setAuthUser((session?.user as User | undefined) ?? null)
          setAuthReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthUser(null)
          setAuthReady(true)
        }
      })
    const unsub = subscribeAuth((session) => {
      const s = session as { user?: User | null } | null
      setAuthUser(s?.user ?? null)
    })
    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  return { authUser, setAuthUser, authReady }
}
