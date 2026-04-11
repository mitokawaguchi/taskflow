/**
 * ARCH-001: App.jsx 200行以下化のためデータ取得・state・load 効果を集約
 */
import { useState, useEffect } from 'react'
import {
  fetchProjects,
  fetchTasks,
  fetchTemplates,
  fetchRemember,
  fetchClients,
  fetchCategories,
  fetchUsers,
  updateTask,
  fetchWeeklyReviews,
  fetchDailyPlanner,
  upsertDailyPlanner,
} from '../api'
import { applyDailyPlannerRollover } from '../utils/applyDailyPlannerRollover'
import { getEffectivePlannerYmd } from '../utils/plannerDay'
import { isOverdue } from '../utils'

export function useAppData(authUser, addToast) {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [templates, setTemplates] = useState([])
  const [clients, setClients] = useState([])
  const [remembers, setRemembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [users, setUsers] = useState([])
  const [weeklyReviews, setWeeklyReviews] = useState([])
  const [dailyPlanner, setDailyPlanner] = useState({
    todayTaskIds: [],
    tomorrowTaskIds: [],
    plannerAnchorYmd: null,
  })

  useEffect(() => {
    if (!authUser) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    async function load() {
      try {
        const [projs, ts, tpls, clis, rems] = await Promise.all([
          fetchProjects(),
          fetchTasks(),
          fetchTemplates(),
          fetchClients(),
          fetchRemember(),
        ])
        let cats = []
        let usrs = []
        try {
          cats = await fetchCategories()
        } catch (e) {
          if (!cancelled) addToast('⚠️', 'カテゴリの読み込みに失敗しました', e?.message ?? '')
        }
        try {
          usrs = await fetchUsers()
        } catch (e) {
          if (!cancelled) addToast('⚠️', '担当者の読み込みに失敗しました', e?.message ?? '')
        }
        let wrevs = []
        try {
          wrevs = await fetchWeeklyReviews()
        } catch (e) {
          if (!cancelled && import.meta.env?.DEV) {
            console.warn('weekly_reviews:', e?.message ?? e)
          }
        }
        let dp = { todayTaskIds: [], tomorrowTaskIds: [], plannerAnchorYmd: null }
        try {
          dp = await fetchDailyPlanner()
        } catch (e) {
          if (!cancelled && import.meta.env?.DEV) {
            console.warn('daily_planner:', e?.message ?? e)
          }
        }
        const effectiveYmd = getEffectivePlannerYmd()
        const rolled = applyDailyPlannerRollover(
          {
            todayTaskIds: dp.todayTaskIds,
            tomorrowTaskIds: dp.tomorrowTaskIds,
            plannerAnchorYmd: dp.plannerAnchorYmd ?? null,
          },
          effectiveYmd
        )
        const anchorChanged = (dp.plannerAnchorYmd ?? null) !== (rolled.next.plannerAnchorYmd ?? null)
        if (!cancelled && (rolled.didRollover || anchorChanged)) {
          try {
            await upsertDailyPlanner(rolled.next)
          } catch (e) {
            if (!cancelled) addToast('⚠️', '今日・明日プランの日付更新に失敗しました', e?.message ?? '')
          }
        }
        if (!cancelled) {
          let tasksToSet = ts
          const overdueNotCritical = ts.filter((t) => !t.done && isOverdue(t.due) && t.priority !== 'critical')
          if (overdueNotCritical.length > 0) {
            try {
              await Promise.all(overdueNotCritical.map((t) => updateTask(t.id, { ...t, priority: 'critical' })))
              tasksToSet = ts.map((t) => (overdueNotCritical.some((u) => u.id === t.id) ? { ...t, priority: 'critical' } : t))
            } catch (e) {
              if (!cancelled) addToast('⚠️', '期限超過タスクの更新に失敗しました', e?.message ?? '')
            }
          }
          setProjects(projs)
          setTasks(tasksToSet)
          setTemplates(tpls)
          setClients(clis)
          setRemembers(rems)
          setCategories(cats)
          setUsers(usrs)
          setWeeklyReviews(wrevs)
          setDailyPlanner(rolled.next)
        }
      } catch (e) {
        if (!cancelled) addToast('❌', '読み込みエラー', e?.message ?? 'データを取得できませんでした')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [authUser, addToast])

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
  }, [authUser, loading, addToast])

  return {
    tasks,
    setTasks,
    projects,
    setProjects,
    templates,
    setTemplates,
    clients,
    setClients,
    remembers,
    setRemembers,
    categories,
    setCategories,
    users,
    setUsers,
    loading,
    setLoading,
    weeklyReviews,
    setWeeklyReviews,
    dailyPlanner,
    setDailyPlanner,
  }
}
