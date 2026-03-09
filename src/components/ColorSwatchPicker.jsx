import { useState } from 'react'
import { CATEGORY_COLOR_PALETTE } from '../constants'

/** 色を視覚的に選択するUI（スウォッチ＋任意でカスタム色） */
export default function ColorSwatchPicker({ value, onChange, ariaLabel = '色を選択' }) {
  const [customOpen, setCustomOpen] = useState(false)
  return (
    <div className="color-swatch-picker" role="group" aria-label={ariaLabel}>
      <div className="color-swatch-grid">
        {CATEGORY_COLOR_PALETTE.map((hex) => (
          <button
            key={hex}
            type="button"
            className={`color-swatch ${value === hex ? 'active' : ''}`}
            style={{ background: hex }}
            onClick={() => {
              onChange(hex)
              setCustomOpen(false)
            }}
            title={hex}
            aria-label={hex}
            aria-pressed={value === hex}
          />
        ))}
      </div>
      <div className="color-swatch-custom">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setCustomOpen((o) => !o)}
          aria-expanded={customOpen}
        >
          {customOpen ? '閉じる' : 'カスタム色'}
        </button>
        {customOpen && (
          <label className="color-swatch-custom-input">
            <input
              type="color"
              value={value.startsWith('#') && value.length === 7 ? value : '#6b7280'}
              onChange={(e) => onChange(e.target.value)}
              aria-label="カスタム色"
            />
          </label>
        )}
      </div>
    </div>
  )
}
