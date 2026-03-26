/** 公開デモ用。ビルド時に Vite が `import.meta.env` を置換する */
export function getIsPublicDemoMode(): boolean {
  return import.meta.env.VITE_PUBLIC_DEMO_MODE === 'true'
}
