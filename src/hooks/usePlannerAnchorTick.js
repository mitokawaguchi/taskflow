import { useEffect } from 'react'
import { upsertDailyPlanner } from '../api'
import { applyDailyPlannerRollover } from '../utils/applyDailyPlannerRollover'
import { getEffectivePlannerYmd } from '../utils/plannerDay'

/** 日付またぎでプランのアンカーを同期し、必要ならサーバへ保存する */
export function usePlannerAnchorTick(authUser, loading, addToast, setDailyPlanner) {
  useEffect(() => {
    if (!authUser || loading) return undefined
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      const effective = getEffectivePlannerYmd()
      setDailyPlanner((prev) => {
        const rolled = applyDailyPlannerRollover(
          {
            todayTaskIds: prev.todayTaskIds ?? [],
            tomorrowTaskIds: prev.tomorrowTaskIds ?? [],
            plannerAnchorYmd: prev.plannerAnchorYmd ?? null,
          },
          effective
        )
        const prevAnchor = prev.plannerAnchorYmd ?? null
        const nextAnchor = rolled.next.plannerAnchorYmd ?? null
        if (!cancelled && (rolled.didRollover || prevAnchor !== nextAnchor)) {
          upsertDailyPlanner(rolled.next).catch((e) => {
            if (!cancelled) addToast('⚠️', '今日・明日プランの日付更新に失敗しました', e?.message ?? '')
          })
        }
        return rolled.next
      })
    }
    tick()
    const id = setInterval(tick, 60_000)
    const onVis = () => {
      if (document.visibilityState === 'visible') tick()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [authUser, loading, addToast, setDailyPlanner])
}
