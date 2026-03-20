import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../supabase'
import { fetchChatworkUnread } from './fetchChatworkUnread'
import type { ChatworkUnreadRow } from './chatwork-unread-types'

const POLL_MS = 5 * 60 * 1000

type Toast = (icon: string, title: string, msg: string) => void

/** Chatwork 未返信（Edge）。ログイン時のみ取得 */
export function useChatworkUnread(addToast: Toast, authUserId: string | undefined) {
  const [items, setItems] = useState<ChatworkUnreadRow[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!supabase || !authUserId) {
      setItems([])
      return
    }
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) {
      setItems([])
      return
    }
    try {
      setLoading(true)
      const rows = await fetchChatworkUnread(token)
      setItems(rows)
    } catch (e) {
      console.error(e)
      addToast(
        '❌',
        'Chatwork 取得失敗',
        e instanceof Error ? e.message : '未返信一覧を取得できませんでした（Edge の Secrets を確認）',
      )
    } finally {
      setLoading(false)
    }
  }, [addToast, authUserId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!authUserId) return undefined
    const id = globalThis.setInterval(() => {
      void load()
    }, POLL_MS)
    return () => globalThis.clearInterval(id)
  }, [authUserId, load])

  return { items, loading, reload: load }
}
