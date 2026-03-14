import { endDateLabel } from '../utils'

/** DragOverlay 用のプロジェクトカードプレビュー（SMELL-002: IIFE をコンポーネント化） */
export default function ProjectCardDragPreview({ item }) {
  if (!item) return null
  const { project: p, ptasks, pct } = item
  return (
    <div
      className="project-card project-card-overlay"
      style={{
        background: `${p.color}28`,
        border: `1px solid ${p.color}60`,
      }}
    >
      <div className="project-card-header cursor-grabbing">
        <span className="project-card-drag-handle" aria-hidden>⋮⋮</span>
        <div className="project-icon" style={{ background: `${p.color}20` }}>{p.icon}</div>
        <div>
          <div className="project-name">{p.name}</div>
          <div className="project-count">
            {ptasks.filter((t) => !t.done).length} 件残り
            {p.endDate && <span className="project-due"> · {endDateLabel(p.endDate)}</span>}
          </div>
        </div>
      </div>
      <div className="project-progress">
        <div
          className="project-progress-fill"
          style={{ width: `${pct}%`, background: p.color }}
        />
      </div>
      <div className="project-pct-label">{pct}% 完了</div>
    </div>
  )
}
