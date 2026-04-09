import { useCallback, useMemo, useState } from 'react'
import { upsertWeeklyReview } from '../../api'

function weekBounds(d = new Date()) {
  const day = d.getDay()
  const diffToMon = (day + 6) % 7
  const start = new Date(d)
  start.setDate(d.getDate() - diffToMon)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const iso = (x) => x.toISOString().slice(0, 10)
  return { weekStart: iso(start), weekEnd: iso(end) }
}

/** 週次ふりかえり（最小構成・保存のみ） */
export default function WeeklyReviewScreen({ tasks, addToast, onSaved }) {
  const { weekStart, weekEnd } = useMemo(() => weekBounds(), [])
  const [growth, setGrowth] = useState('')
  const [saving, setSaving] = useState(false)

  const doneTasks = useMemo(() => tasks.filter((t) => t.done).slice(0, 30), [tasks])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await upsertWeeklyReview({
        weekStart,
        weekEnd,
        topAchievements: [],
        wastedEfforts: [],
        hypothesisResults: [],
        nextWeekFocus: [],
        growthNote: growth.trim() || null,
      })
      try {
        localStorage.setItem('taskflow_last_weekly_note', growth.trim())
      } catch {
        /* ignore */
      }
      addToast('📝', '保存しました', '今週のふりかえり')
      onSaved?.()
    } catch (e) {
      addToast('❌', '保存に失敗しました', e?.message ?? '')
    } finally {
      setSaving(false)
    }
  }, [weekStart, weekEnd, growth, addToast, onSaved])

  return (
    <div className="weekly-review-screen">
      <h2 className="weekly-review-screen__title">今週のふりかえり</h2>
      <p className="text-muted weekly-review-screen__range">
        {weekStart} 〜 {weekEnd}
      </p>
      <p className="text-muted weekly-review-screen__hint">
        詳細フォーム（TOP3・予想の検証など）は順次拡張予定です。まずは今週の成長メモだけでも記録できます。
      </p>
      <div className="form-group">
        <label className="form-label" htmlFor="wr-growth">
          今週の自分、何が成長した？
        </label>
        <textarea
          id="wr-growth"
          className="form-textarea"
          value={growth}
          onChange={(e) => setGrowth(e.target.value)}
          placeholder="小さいことでOK"
          rows={3}
        />
      </div>
      <div className="weekly-review-screen__done-hint">
        <span className="form-label">完了タスク（参考）</span>
        <ul className="weekly-review-screen__tasklist">
          {doneTasks.length === 0 ? (
            <li className="text-muted">完了タスクがありません</li>
          ) : (
            doneTasks.map((t) => (
              <li key={t.id}>
                {t.done ? '✓' : ''} {t.title}
              </li>
            ))
          )}
        </ul>
      </div>
      <button type="button" className="btn btn-primary" disabled={saving} onClick={handleSave}>
        {saving ? '保存中…' : 'ふりかえりを保存'}
      </button>
    </div>
  )
}
