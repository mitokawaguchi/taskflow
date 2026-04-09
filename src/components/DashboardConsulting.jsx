import { useMemo } from 'react'

/** 今月の範囲（ローカル日付） */
function monthRangeMs() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { startMs: start.getTime(), endMs: end.getTime() }
}

/** 外コンOS ダッシュボード用ウィジェット（最大3） */
export function DashboardConsulting({ tasks, weeklyReviews = [] }) {
  const stats = useMemo(() => {
    const { startMs, endMs } = monthRangeMs()
    const doneInMonth = tasks.filter((t) => {
      if (!t.done) return false
      const ca = t.completedAt
      if (!ca) return false
      const ms = new Date(ca).getTime()
      return ms >= startMs && ms <= endMs
    })
    const withHyp = doneInMonth.filter((t) => t.hypothesis && String(t.hypothesis).trim())
    let reviewedHits = 0
    let reviewedTotal = 0
    for (const w of weeklyReviews) {
      for (const h of w.hypothesisResults || []) {
        if (!h?.hypothesis) continue
        reviewedTotal += 1
        if (h.result === 'hit') reviewedHits += 1
      }
    }
    const hitPct = reviewedTotal > 0 ? Math.round((reviewedHits / reviewedTotal) * 100) : null

    let onTime = 0
    let timed = 0
    for (const t of doneInMonth) {
      if (!t.timeboxMinutes || !t.timerStartedAt || !t.completedAt) continue
      timed += 1
      const start = new Date(t.timerStartedAt).getTime()
      const end = new Date(t.completedAt).getTime()
      const limitMs = t.timeboxMinutes * 60 * 1000
      if (end - start <= limitMs) onTime += 1
    }
    const timePct = timed > 0 ? Math.round((onTime / timed) * 100) : null

    const chains = []
    const byId = new Map(tasks.map((x) => [x.id, x]))
    const isChainTarget = new Set(tasks.map((t) => t.nextTaskId).filter(Boolean))
    const heads = tasks.filter((t) => t.nextTaskId && !isChainTarget.has(t.id))
    for (const head of heads) {
      const seq = []
      let cur = head
      while (cur && seq.length < 25) {
        seq.push(cur.title)
        cur = cur.nextTaskId ? byId.get(cur.nextTaskId) : null
      }
      if (seq.length >= 2) chains.push(seq)
    }

    return {
      hypWritten: withHyp.length,
      hypHitPct: hitPct,
      hypReviewed: reviewedTotal,
      chains: chains.slice(0, 5),
      timePct,
      timed,
    }
  }, [tasks, weeklyReviews])

  return (
    <div className="dashboard-consulting">
      <div className="dashboard-section">
        <h2 className="dashboard-section__title">予想の的中率</h2>
        <div className="dashboard-consulting__card">
          <div className="dashboard-consulting__big">
            {stats.hypHitPct != null ? `${stats.hypHitPct}%` : '—'}
          </div>
          <p className="dashboard-consulting__sub">
            今月「まず答え」を書いて完了したタスク: {stats.hypWritten} 件
            <br />
            ふりかえりで検証した予想: {stats.hypReviewed} 件
            {stats.hypReviewed === 0 && (
              <span className="text-muted">（週のふりかえりで当たり外れを記録すると%が出ます）</span>
            )}
          </p>
        </div>
      </div>
      <div className="dashboard-section">
        <h2 className="dashboard-section__title">アクションの連鎖</h2>
        {stats.chains.length === 0 ? (
          <p className="dashboard-empty">完了時に「次のタスク」をつないだ流れがまだありません</p>
        ) : (
          <ul className="dashboard-consulting__chains">
            {stats.chains.map((titles, i) => (
              <li key={i} className="dashboard-consulting__chain">
                {titles.join(' → ')}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="dashboard-section">
        <h2 className="dashboard-section__title">時間内に終わった率</h2>
        <div className="dashboard-consulting__card">
          {stats.timed === 0 ? (
            <p className="dashboard-empty">タイムボックス開始〜完了が記録されたタスクがまだありません</p>
          ) : (
            <>
              <div className="dashboard-consulting__bar-wrap">
                <div
                  className="dashboard-consulting__bar"
                  style={{ width: `${stats.timePct ?? 0}%` }}
                />
              </div>
              <p className="dashboard-consulting__sub">
                {stats.timePct}%（タイマー利用の完了 {stats.timed} 件ベース）
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
