import { getStatusLabel } from '../constants'

/** 色以外の手がかり（記号）。リボン色と対応 */
const STATUS_MARK = {
  todo: '□',
  in_progress: '▶',
  review: '◆',
  done: '✓',
}

/**
 * @param {{ statusKey: string }} props
 */
export function TaskStatusBadge({ statusKey }) {
  const label = getStatusLabel(statusKey)
  const mark = STATUS_MARK[statusKey] ?? '·'
  return (
    <span className={`task-status-badge task-status-badge--${statusKey}`.trim()} title={`進捗: ${label}`}>
      <span className="task-status-badge__mark" aria-hidden="true">
        {mark}
      </span>
      <span className="task-status-badge__label">{label}</span>
    </span>
  )
}
