import { useState } from 'react'
import { VALIDATION, truncateToMax } from '../constants'

const PRESETS = [15, 30, 60]

/** タスク完了直後：次の一手をタスク化するモーダル（外コンOS） */
export default function CompleteNextTaskModal({ task, onSkip, onCreateNext, onClose }) {
  const [title, setTitle] = useState('')
  const [minutes, setMinutes] = useState(30)

  if (!task) return null

  const handlePrimary = async () => {
    const t = truncateToMax(String(title).trim(), VALIDATION.taskTitle)
    if (!t) return
    await onCreateNext(t, minutes)
  }

  return (
    <div className="overlay complete-next-overlay" role="presentation">
      <div
        className="modal complete-next-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-next-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="complete-next-title" className="complete-next-modal__title">
          タスク完了！
        </h2>
        <p className="complete-next-modal__lead">
          このタスクの結果を受けて、次にやるべきことは？
        </p>
        <div className="form-group">
          <label className="form-label" htmlFor="complete-next-title-input">
            次の一手
          </label>
          <input
            id="complete-next-title-input"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="次の一手を書く"
            autoFocus
          />
        </div>
        <div className="form-group">
          <label className="form-label">何分？</label>
          <div className="taskform-deep__time-row">
            <input
              type="number"
              className="form-input taskform-deep__time-input"
              min={1}
              max={24 * 60}
              value={minutes}
              onChange={(e) => {
                const n = Number.parseInt(e.target.value, 10)
                setMinutes(Number.isFinite(n) && n > 0 ? n : 30)
              }}
              aria-label="次のタスクのタイムボックス（分）"
            />
            <span className="taskform-deep__time-suffix">分</span>
          </div>
          <div className="taskform-deep__presets" role="group">
            {PRESETS.map((m) => (
              <button key={m} type="button" className="btn btn-ghost btn-sm" onClick={() => setMinutes(m)}>
                {m}分
              </button>
            ))}
          </div>
        </div>
        <div className="complete-next-modal__actions">
          <button type="button" className="btn btn-primary" onClick={handlePrimary}>
            次のタスクを作成して完了
          </button>
          <button type="button" className="complete-next-modal__skip" onClick={onSkip}>
            スキップして完了
          </button>
          <button type="button" className="btn btn-ghost btn-sm complete-next-modal__cancel" onClick={onClose}>
            キャンセル（完了しない）
          </button>
        </div>
      </div>
    </div>
  )
}
