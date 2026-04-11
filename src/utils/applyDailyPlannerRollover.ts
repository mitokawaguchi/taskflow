export type DailyPlannerClientState = {
  todayTaskIds: string[]
  tomorrowTaskIds: string[]
  plannerAnchorYmd: string | null
}

export function applyDailyPlannerRollover(
  state: DailyPlannerClientState,
  effectiveYmd: string
): { next: DailyPlannerClientState; didRollover: boolean } {
  const anchor = state.plannerAnchorYmd ?? null
  if (anchor === null) {
    return {
      next: { ...state, plannerAnchorYmd: effectiveYmd },
      didRollover: false,
    }
  }
  if (anchor === effectiveYmd) {
    return { next: state, didRollover: false }
  }
  if (anchor < effectiveYmd) {
    return {
      next: {
        todayTaskIds: state.tomorrowTaskIds,
        tomorrowTaskIds: [],
        plannerAnchorYmd: effectiveYmd,
      },
      didRollover: true,
    }
  }
  return {
    next: { ...state, plannerAnchorYmd: effectiveYmd },
    didRollover: false,
  }
}
