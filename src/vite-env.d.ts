/// <reference types="vite/client" />
/// <reference types="@testing-library/jest-dom/vitest" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
  readonly VITE_GOOGLE_REDIRECT_URI?: string
  /** `true` のとき公開デモ（ログイン画面なし）。業務用デプロイでは未設定または `false` */
  readonly VITE_PUBLIC_DEMO_MODE?: string
  /** デモページの「ソースコード」リンク先（任意） */
  readonly VITE_PUBLIC_REPO_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
