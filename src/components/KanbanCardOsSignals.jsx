import { useEffect, useMemo, useRef, useState } from 'react'

/**
 * カンバンカード用：タイムボックス・仮説・リスク・次タスク（外コンOS）
 */
export function KanbanCardOsSignals({ task, tasksById, onPatchTask, onScrollToTask }) {
  const [tick, setTick] = useState(0)
  const m = task.timeboxMinutes
  const started = task.timerStartedAt

  useEffect(() => {
    if (!m || !started) return undefined
    const id = setInterval(() => setTick((x) => x + 1), 1000)
    return () => clearInterval(id)
  }, [m, started])

  const { leftSec, over } = useMemo(() => {
    if (!m || !started) return { leftSec: null, over: false }
    const startMs = new Date(started).getTime()
    const endMs = startMs + m * 60 * 1000
    const left = Math.max(0, Math.floor((endMs - Date.now()) / 1000))
    return { leftSec: left, over: Date.now() > endMs }
  }, [m, started, tick])

  const notifiedRef = useRef(false)
  useEffect(() => {
    if (!over) {
      notifiedRef.current = false
      return undefined
    }
    if (notifiedRef.current) return undefined
    notifiedRef.current = true
    if (typeof globalThis.Notification === 'undefined' || globalThis.Notification.permission !== 'granted') {
      return undefined
    }
    try {
      new globalThis.Notification('タイムボックス終了', { body: task.title, tag: `tb-${task.id}` })
    } catch {
      /* ignore */
    }
    return undefined
  }, [over, m, started, task.title, task.id])

  const prem = task.premortemRisks && task.premortemRisks[0] ? task.premortemRisks[0].text : ''
  const nextT = task.nextTaskId ? tasksById.get(task.nextTaskId) : null

  const handleTimeClick = (e) => {
    e.stopPropagation()
    if (!onPatchTask || !m || started) return
    onPatchTask(task.id, { timerStartedAt: new Date().toISOString() })
  }

  return (
    <div className="kanban-os-signals" onClick={(e) => e.stopPropagation()}>
      {m != null && m > 0 && (
        <button
          type="button"
          className={`kanban-os-badge ${over ? 'kanban-os-badge--over' : ''}`}
          title={started ? 'タイムボックス進行中' : 'クリックでタイマー開始'}
          onClick={handleTimeClick}
        >
          ⏱ {m}分
          {started && leftSec != null && (
            <span className="kanban-os-timer">
              {over ? '（超過）' : `残り${Math.floor(leftSec / 60)}:${String(leftSec % 60).padStart(2, '0')}`}
            </span>
          )}
        </button>
      )}
      {task.hypothesis && String(task.hypothesis).trim() && (
        <span className="kanban-os-icon" title={String(task.hypothesis)} aria-label="まず置いた答え">
          🎯
        </span>
      )}
      {prem && (
        <span className="kanban-os-icon" title={prem} aria-label="想定リスク">
          ⚠️
        </span>
      )}
      {nextT && onScrollToTask && (
        <button
          type="button"
          className="kanban-os-chain"
          title={`次: ${nextT.title}`}
          onClick={(e) => {
            e.stopPropagation()
            onScrollToTask(nextT.id)
          }}
          aria-label="次のタスクへ移動"
        >
          →
        </button>
      )}
    </div>
  )
}
