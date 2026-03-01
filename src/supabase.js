import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 環境変数が無いときは throw せず null。アプリは描画され、API 呼び出し時にエラー表示する
export const supabase =
  url && anonKey ? createClient(url, anonKey) : null

export const hasSupabase = () => Boolean(supabase)
