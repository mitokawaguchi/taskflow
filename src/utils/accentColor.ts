/** 設定で選んだキーカラーを CSS 変数へ反映（index.css のデフォルトを上書き） */

export const ACCENT_STORAGE_KEY = 'taskflow_accent_hex'

const ACCENT_VARS = [
  '--accent',
  '--accent-hover',
  '--accent-rgb',
  '--accent-hover-rgb',
  '--accent-glow',
] as const

export function parseHexColor(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim())
  if (!m) return null
  const n = Number.parseInt(m[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function mixBlack(r: number, g: number, b: number, t: number): { r: number; g: number; b: number } {
  return {
    r: Math.round(r * (1 - t)),
    g: Math.round(g * (1 - t)),
    b: Math.round(b * (1 - t)),
  }
}

function mixWhite(r: number, g: number, b: number, t: number): { r: number; g: number; b: number } {
  return {
    r: Math.round(r + (255 - r) * t),
    g: Math.round(g + (255 - g) * t),
    b: Math.round(b + (255 - b) * t),
  }
}

function toRgbTriplet(r: number, g: number, b: number): string {
  return `${r}, ${g}, ${b}`
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (x: number) => x.toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

/**
 * カスタムアクセントを適用。hex が null / 無効なら index.css の値に戻す。
 */
export function applyAccentToDocument(hex: string | null, theme: 'light' | 'dark'): void {
  const root = document.documentElement
  if (typeof root?.style?.removeProperty !== 'function') return

  for (const v of ACCENT_VARS) {
    root.style.removeProperty(v)
  }

  if (!hex?.trim()) return

  const rgb = parseHexColor(hex)
  if (!rgb) return

  const { r, g, b } = rgb
  const hover =
    theme === 'dark' ? mixWhite(r, g, b, 0.22) : mixBlack(r, g, b, 0.14)
  const glowAlpha = theme === 'dark' ? 0.14 : 0.1

  root.style.setProperty('--accent', rgbToHex(r, g, b))
  root.style.setProperty('--accent-hover', rgbToHex(hover.r, hover.g, hover.b))
  root.style.setProperty('--accent-rgb', toRgbTriplet(r, g, b))
  root.style.setProperty('--accent-hover-rgb', toRgbTriplet(hover.r, hover.g, hover.b))
  root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, ${glowAlpha})`)
}
