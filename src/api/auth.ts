import { supabase } from '../supabase'
import { CONFIG_MSG } from './helpers'

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) throw new Error(CONFIG_MSG)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

/** 新規アカウント作成。メール確認が有効な場合は session が null になり確認メールが送られる。 */
export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) throw new Error(CONFIG_MSG)
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    ...(redirectTo && { options: { emailRedirectTo: redirectTo } }),
  })
  const isAlreadyRegistered =
    error &&
    (error.code === 'user_already_registered' ||
      /already registered|already exists|already in use/i.test(String(error.message ?? '')))
  if (isAlreadyRegistered) {
    const err = new Error('このメールアドレスは既に登録されています。') as Error & { code?: string }
    err.code = 'user_already_registered'
    throw err
  }
  if (error) throw error
  if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    const err = new Error('このメールアドレスは既に登録されています。') as Error & { code?: string }
    err.code = 'user_already_registered'
    throw err
  }
  return data
}

export async function signOut(): Promise<void> {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function updateAuthPassword(newPassword: string) {
  if (!supabase) throw new Error(CONFIG_MSG)
  const { data, error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
  return data
}

export async function updateAuthUserMetadata(metadata: Record<string, unknown>) {
  if (!supabase) throw new Error(CONFIG_MSG)
  const { data, error } = await supabase.auth.updateUser({ data: metadata })
  if (error) throw error
  return data
}

export function subscribeAuth(callback: (session: unknown) => void): () => void {
  if (!supabase?.auth) return () => {}
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_ev, session) => callback(session))
  return () => subscription.unsubscribe()
}
