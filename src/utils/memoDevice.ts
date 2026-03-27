/**
 * メモ帳の編集を許可するデバイス判定（iPad のみ編集可・PC は閲覧専用）
 * iPadOS 13+ の Safari は Macintosh として報告するため maxTouchPoints を併用する
 */
export function detectIpadMemoEditingFromEnv(
  userAgent: string,
  platform: string,
  maxTouchPoints: number
): boolean {
  if (/iPad/i.test(userAgent)) return true
  if (platform === 'MacIntel' && maxTouchPoints > 1) return true
  return false
}

export function isIpadMemoEditingDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  return detectIpadMemoEditingFromEnv(navigator.userAgent, navigator.platform, navigator.maxTouchPoints)
}
