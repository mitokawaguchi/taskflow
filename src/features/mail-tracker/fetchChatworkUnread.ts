import { supabase } from '../../supabase'
import type { ChatworkUnreadRow } from './chatwork-unread-types'

type InvokeOk = { ok?: boolean; items?: ChatworkUnreadRow[]; error?: string }

/** Edge Function fetch-chatwork-unread を呼び出す（要ログイン・Secrets 設定済み） */
export async function fetchChatworkUnread(accessToken: string): Promise<ChatworkUnreadRow[]> {
  if (!supabase) throw new Error('Supabase が未設定です')
  const { data, error } = await supabase.functions.invoke<InvokeOk>('fetch-chatwork-unread', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (error) throw error
  if (data && typeof data === 'object' && 'ok' in data && data.ok === false) {
    throw new Error(data.error ?? 'fetch_chatwork_unread_failed')
  }
  if (!data?.items || !Array.isArray(data.items)) return []
  return data.items
}
