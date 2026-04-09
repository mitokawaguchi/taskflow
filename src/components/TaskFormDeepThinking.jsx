import { useEffect, useState } from 'react'
import { VALIDATION, truncateToMax } from '../constants'

const LS_KEY = 'taskflow_deep_thinking_open'

const PSETS = [15, 30, 60, 90]

/** 「もう一歩深く考える」折りたたみセクション（外コンOS） */
export function TaskFormDeepThinking({ form, set }) {
  const [open, setOpen] = useState(() => {
    try {
      const v = localStorage.getItem(LS_KEY)
      return v !== '0'
    } catch {
      return true
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, open ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [open])

  const premortemLine =
    form.premortemRisks && form.premortemRisks[0] && form.premortemRisks[0].text
      ? form.premortemRisks[0].text
      : ''

  const setPremortemLine = (text) => {
    const t = truncateToMax(String(text), VALIDATION.premortemLine)
    set('premortemRisks', t.trim() ? [{ text: t.trim() }] : [])
  }

  return (
    <div className="taskform-deep panel-accent">
      <button
        type="button"
        className="taskform-deep__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="taskform-deep__toggle-label">もう一歩深く考える</span>
        <span className="taskform-deep__chevron" aria-hidden>
          {open ? '▼' : '▶'}
        </span>
      </button>
      {open && (
        <div className="taskform-deep__body">
          <div className="form-group">
            <label className="form-label">何分で終わらせる？</label>
            <div className="taskform-deep__time-row">
              <input
                type="number"
                className="form-input taskform-deep__time-input"
                min={1}
                max={24 * 60}
                value={form.timeboxMinutes != null ? form.timeboxMinutes : ''}
                onChange={(e) => {
                  const v = e.target.value
                  if (v === '') {
                    set('timeboxMinutes', null)
                    return
                  }
                  const n = Number.parseInt(v, 10)
                  set('timeboxMinutes', Number.isFinite(n) && n > 0 ? n : null)
                }}
                placeholder="分"
                aria-label="タイムボックス（分）"
              />
              <span className="taskform-deep__time-suffix">分</span>
            </div>
            <div className="taskform-deep__presets" role="group" aria-label="時間プリセット">
              {PSETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => set('timeboxMinutes', m)}
                >
                  {m}分
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">まず答えを置いてみて</label>
            <textarea
              className="form-textarea"
              value={form.hypothesis ?? ''}
              onChange={(e) => set('hypothesis', truncateToMax(e.target.value, VALIDATION.taskHypothesis))}
              placeholder="今の時点での予想は？"
              rows={2}
            />
          </div>
          <div className="form-group">
            <label className="form-label">これが失敗するとしたら？</label>
            <textarea
              className="form-textarea"
              value={premortemLine}
              onChange={(e) => setPremortemLine(e.target.value)}
              placeholder="最大のリスクを1つだけ"
              rows={2}
            />
          </div>
        </div>
      )}
    </div>
  )
}
