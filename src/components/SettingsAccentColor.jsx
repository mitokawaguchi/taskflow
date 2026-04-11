import { parseHexColor } from '../utils/accentColor'

const PRESETS = [
  { label: 'アプリ既定', value: '' },
  { label: 'インディゴ', value: '#5e6ad2' },
  { label: 'グリーン', value: '#3a8f52' },
  { label: 'ブルー', value: '#2563eb' },
  { label: 'ローズ', value: '#db2777' },
  { label: 'オレンジ', value: '#ea580c' },
]

/** @param {string} raw */
function normalizeHexInput(raw) {
  const t = raw.trim()
  if (!t) return ''
  const withHash = t.startsWith('#') ? t : `#${t}`
  return parseHexColor(withHash) ? withHash.toLowerCase() : ''
}

/**
 * @param {{ accentHex: string; setAccentHex: (v: string | ((p: string) => string)) => void; theme: string }} props
 */
export function SettingsAccentColor({ accentHex, setAccentHex, theme }) {
  const displayColor = accentHex && parseHexColor(accentHex) ? accentHex : '#5e6ad2'

  return (
    <div className="settings-accent">
      <span className="form-label" id="settings-accent-label">
        キーカラー
      </span>
      <p className="form-hint">ボタン・リンク・進行中の帯などの色です。この端末にだけ保存されます。</p>
      <div className="settings-accent__presets" role="group" aria-labelledby="settings-accent-label">
        {PRESETS.map((p) => {
          const active =
            p.value === '' ? accentHex.trim() === '' : accentHex.toLowerCase() === p.value.toLowerCase()
          return (
            <button
              key={p.label + p.value}
              type="button"
              className={`settings-accent__preset ${active ? 'settings-accent__preset--active' : ''}`}
              aria-pressed={active}
              onClick={() => setAccentHex(p.value)}
              title={p.label}
            >
              <span
                className="settings-accent__dot"
                style={p.value ? { background: p.value } : { background: 'linear-gradient(135deg,#5e6ad2 50%,#3a8f52 50%)' }}
                aria-hidden
              />
              <span className="settings-accent__preset-label">{p.label}</span>
            </button>
          )
        })}
      </div>
      <div className="settings-accent__picker-row mt-8">
        <label className="settings-accent__color-label">
          <span className="sr-only">カスタム色</span>
          <input
            type="color"
            className="settings-accent__color-input"
            value={parseHexColor(displayColor) ? displayColor : '#5e6ad2'}
            onChange={(e) => {
              const next = normalizeHexInput(e.target.value)
              if (next) setAccentHex(next)
            }}
            aria-label="カスタムのキーカラーを選ぶ"
          />
        </label>
        <span className="settings-accent__theme-hint text-muted" aria-live="polite">
          {theme === 'dark' ? 'ダークではホバー色が自動で明るめになります。' : 'ライトではホバー色が自動で少し暗くなります。'}
        </span>
      </div>
    </div>
  )
}
