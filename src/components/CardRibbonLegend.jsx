import { PRIORITY_KEYS, TASK_STATUS_KEYS, TASK_STATUS, getPriorityLabel, getPriorityColor } from '../constants'

/** 左リボン色（index.css の task-card--status-* / kanban-card__bar と対応） */
const STATUS_RIBBON_HEX = {
  todo: '#64748b',
  in_progress: '#3a8f52',
  review: '#7c3aed',
  done: '#0f766e',
}

/** 設定画面用: タスクカード左帯＝状態、面・枠＝重要度の説明 */
export function CardRibbonLegend() {
  return (
    <section className="card-ribbon-legend" aria-labelledby="card-ribbon-legend-title">
      <h3 id="card-ribbon-legend-title" className="card-ribbon-legend__title">
        タスクカードの「左の帯」と色
      </h3>
      <p className="card-ribbon-legend__lead">
        一覧・カンバンで共通です。左端の細い帯の色は<strong>進捗（状態）</strong>、カード全体の背景と枠のトーンは<strong>重要度（緊急〜低）</strong>です。
      </p>

      <p className="card-ribbon-legend__subhead">左帯（状態）</p>
      <ul className="card-ribbon-legend__list">
        {TASK_STATUS_KEYS.map((key) => (
          <li key={key} className="card-ribbon-legend__item">
            <span
              className="card-ribbon-legend__swatch card-ribbon-legend__swatch--ribbon"
              style={{ background: STATUS_RIBBON_HEX[key] }}
              aria-hidden
            />
            <span>{TASK_STATUS[key].label}</span>
          </li>
        ))}
      </ul>

      <p className="card-ribbon-legend__subhead">面・枠（重要度）</p>
      <ul className="card-ribbon-legend__list">
        {PRIORITY_KEYS.map((key) => (
          <li key={key} className="card-ribbon-legend__item">
            <span
              className="card-ribbon-legend__swatch card-ribbon-legend__swatch--face"
              style={{ background: `${getPriorityColor(key)}33`, borderColor: `${getPriorityColor(key)}55` }}
              aria-hidden
            />
            <span>{getPriorityLabel(key)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
