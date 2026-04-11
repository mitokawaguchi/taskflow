import { getStatusLabel } from '../constants'

/** 色以外の手がかり（記号）。リボン色と対応 */
const STATUS_MARK = {
  todo: '□',
  in_progress: '▶',
  review: '⌛',
  done: '✓',
}

function badgeTitle(statusKey) {
  if (statusKey === 'review') return '進捗: レビュー中（確認待ち）'
  return `進捗: ${getStatusLabel(statusKey)}`
}

/**
 * @param {{ statusKey: string }} props
 */
export function TaskStatusBadge({ statusKey }) {
  const label = getStatusLabel(statusKey)
  const mark = STATUS_MARK[statusKey] ?? '·'
  return (
    <span className={`task-status-badge task-status-badge--${statusKey}`.trim()} title={badgeTitle(statusKey)}>
      <span className="task-status-badge__mark" aria-hidden="true">
        {mark}
      </span>
      <span className="task-status-badge__label">{label}</span>
    </span>
  )
}
