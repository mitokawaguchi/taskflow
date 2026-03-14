import { useState, useRef, useEffect } from 'react'

/** カテゴリ選択ドロップダウン（TaskForm 用） */
export default function CategoryPicker({ value, onChange, options = [], disabled }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [open])

  const selected = options.find((o) => o.id === value)

  return (
    <div className="form-category-picker" ref={ref}>
      <button
        type="button"
        className="form-category-picker__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="カテゴリを選択"
        disabled={disabled}
      >
        {selected ? (
          <>
            <span className="form-category-picker__swatch" style={{ background: selected.color }} aria-hidden />
            <span>{selected.label}</span>
          </>
        ) : (
          <span className="form-category-picker__empty">なし</span>
        )}
      </button>
      {open && (
        <ul className="form-category-picker__list" role="listbox">
          <li role="option" aria-selected={!value}>
            <button
              type="button"
              className="form-category-picker__option"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              <span className="form-category-picker__swatch form-category-picker__swatch--none" aria-hidden />
              <span>なし</span>
            </button>
          </li>
          {options.map((opt) => (
            <li key={opt.id} role="option" aria-selected={value === opt.id}>
              <button
                type="button"
                className="form-category-picker__option"
                onClick={() => {
                  onChange(opt.id)
                  setOpen(false)
                }}
              >
                <span className="form-category-picker__swatch" style={{ background: opt.color }} aria-hidden />
                <span>{opt.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
