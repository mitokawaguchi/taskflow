import { useCallback, useEffect, useState } from 'react'
import { fetchInboxMessageSummaries } from './gmail-client'
import type { GmailMessageSummary } from './types'
import { sortMessagesOldestFirst } from './gmail-parse'

const POLL_MS = 5 * 60 * 1000
const MAX_RESULTS = 50
const STORAGE_KEY = 'tf_gmail_access_token'

type Toast = (icon: string, title: string, msg: string) => void

/** 未返信メール一覧の取得・5分ポーリング（トークンは sessionStorage に保持） */
export function useMailTracker(addToast: Toast) {
  const [token, setToken] = useState(() => sessionStorage.getItem(STORAGE_KEY) ?? '')
  const [items, setItems] = useState<GmailMessageSummary[]>([])
  const [loading, setLoading] = useState(false)

  const saveToken = useCallback((t: string) => {
    const v = t.trim()
    setToken(v)
    if (v) sessionStorage.setItem(STORAGE_KEY, v)
    else sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  const load = useCallback(async () => {
    if (!token.trim()) {
      setItems([])
      return
    }
    try {
      setLoading(true)
      const raw = await fetchInboxMessageSummaries(token.trim(), MAX_RESULTS)
      setItems(sortMessagesOldestFirst(raw))
    } catch (e) {
      console.error(e)
      addToast('❌', 'Gmail 取得失敗', e instanceof Error ? e.message : '一覧を取得できませんでした')
    } finally {
      setLoading(false)
    }
  }, [addToast, token])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!token.trim()) return undefined
    const id = window.setInterval(() => {
      void load()
    }, POLL_MS)
    return () => window.clearInterval(id)
  }, [token, load])

  return {
    token,
    saveToken,
    items,
    loading,
    reload: load,
  }
}
