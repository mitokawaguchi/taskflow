import { formatDate } from '../utils'

/** ガントチャートのセルホバー時に表示するツールチップ（中身のみ。位置は親が style で指定） */
export default function GanttTooltip({ title, startDate, endDate, status }) {
  return (
    <>
      <div className="gantt-tooltip__title">{title}</div>
      <div className="gantt-tooltip__date">
        {startDate && startDate !== endDate
          ? `${formatDate(startDate)} 〜 ${formatDate(endDate)}`
          : formatDate(endDate)}
      </div>
      {status && <div className="gantt-tooltip__status">状態: {status}</div>}
    </>
  )
}
