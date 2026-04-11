import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const authStorage =
  typeof globalThis !== 'undefined' && globalThis.sessionStorage != null
    ? globalThis.sessionStorage
    : undefined

// 環境変数が無いときは throw せず null。アプリは描画され、API 呼び出し時にエラー表示する
// 認証セッションは sessionStorage（タブ単位）。XSS 時の窃取範囲を localStorage より抑える
const supabaseOptions = authStorage
  ? {
      auth: {
        storage: authStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }
  : undefined

export const supabase = url && anonKey ? createClient(url, anonKey, supabaseOptions) : null

export const hasSupabase = () => Boolean(supabase)
