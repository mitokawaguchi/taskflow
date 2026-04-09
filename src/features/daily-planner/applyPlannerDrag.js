import { arrayMove } from '@dnd-kit/sortable'

const POOL = 'pool-'

function colOfTask(id, todayIds, tomorrowIds) {
  if (todayIds.includes(id)) return 'today'
  if (tomorrowIds.includes(id)) return 'tomorrow'
  return null
}

/**
 * @param {{ active: { id: string | number }, over: { id: string | number } | null }} event
 * @param {{ todayTaskIds: string[], tomorrowTaskIds: string[] }} planner
 * @returns {{ todayTaskIds: string[], tomorrowTaskIds: string[] } | null}
 */
export function applyPlannerDragEnd(event, planner) {
  const { active, over } = event
  if (!over) return null
  const aid = String(active.id)
  const oid = String(over.id)
  let { todayTaskIds: todayIds, tomorrowTaskIds: tomorrowIds } = planner

  const removeId = (ids, id) => ids.filter((x) => x !== id)
  const insertRelative = (ids, targetId, newId, after) => {
    const i = ids.indexOf(targetId)
    if (i < 0) return [...ids, newId]
    const next = [...ids]
    next.splice(after ? i + 1 : i, 0, newId)
    return next
  }

  /** @type {string | null} */
  let tid = null
  if (aid.startsWith(POOL)) {
    tid = aid.slice(POOL.length)
    let destCol = null
    let refId = null
    if (oid === 'today-zone' || oid === 'tomorrow-zone') {
      destCol = oid === 'today-zone' ? 'today' : 'tomorrow'
    } else {
      const oc = colOfTask(oid, todayIds, tomorrowIds)
      if (oc) {
        destCol = oc
        refId = oid
      }
    }
    if (!destCol || !tid) return null
    if (todayIds.includes(tid) || tomorrowIds.includes(tid)) return null
    if (destCol === 'today') {
      todayIds = refId ? insertRelative(removeId(todayIds, tid), refId, tid, false) : [...todayIds, tid]
    } else {
      tomorrowIds = refId ? insertRelative(removeId(tomorrowIds, tid), refId, tid, false) : [...tomorrowIds, tid]
    }
    return { todayTaskIds: todayIds, tomorrowTaskIds: tomorrowIds }
  }

  tid = aid
  const from = colOfTask(tid, todayIds, tomorrowIds)
  if (!from) return null

  if (oid === 'pool-zone') {
    if (from === 'today') todayIds = removeId(todayIds, tid)
    else tomorrowIds = removeId(tomorrowIds, tid)
    return { todayTaskIds: todayIds, tomorrowTaskIds: tomorrowIds }
  }

  if (oid === 'today-zone' && from === 'tomorrow') {
    tomorrowIds = removeId(tomorrowIds, tid)
    todayIds = [...todayIds, tid]
    return { todayTaskIds: todayIds, tomorrowTaskIds: tomorrowIds }
  }
  if (oid === 'tomorrow-zone' && from === 'today') {
    todayIds = removeId(todayIds, tid)
    tomorrowIds = [...tomorrowIds, tid]
    return { todayTaskIds: todayIds, tomorrowTaskIds: tomorrowIds }
  }

  const overCol = colOfTask(oid, todayIds, tomorrowIds)
  if (overCol && overCol !== from && (oid === tid ? false : true)) {
    if (from === 'today') todayIds = removeId(todayIds, tid)
    else tomorrowIds = removeId(tomorrowIds, tid)
    if (overCol === 'today') todayIds = insertRelative(todayIds, oid, tid, false)
    else tomorrowIds = insertRelative(tomorrowIds, oid, tid, false)
    return { todayTaskIds: todayIds, tomorrowTaskIds: tomorrowIds }
  }

  if (from === 'today' && overCol === 'today') {
    const oldIndex = todayIds.indexOf(tid)
    const newIndex = todayIds.indexOf(oid)
    if (oldIndex < 0 || newIndex < 0 || tid === oid) return null
    return { todayTaskIds: arrayMove(todayIds, oldIndex, newIndex), tomorrowTaskIds: tomorrowIds }
  }
  if (from === 'tomorrow' && overCol === 'tomorrow') {
    const oldIndex = tomorrowIds.indexOf(tid)
    const newIndex = tomorrowIds.indexOf(oid)
    if (oldIndex < 0 || newIndex < 0 || tid === oid) return null
    return { todayTaskIds: todayIds, tomorrowTaskIds: arrayMove(tomorrowIds, oldIndex, newIndex) }
  }

  if (from === 'today' && oid === 'today-zone') {
    const i = todayIds.indexOf(tid)
    if (i < 0) return null
    return { todayTaskIds: [...removeId(todayIds, tid), tid], tomorrowTaskIds: tomorrowIds }
  }
  if (from === 'tomorrow' && oid === 'tomorrow-zone') {
    const i = tomorrowIds.indexOf(tid)
    if (i < 0) return null
    return { todayTaskIds: todayIds, tomorrowTaskIds: [...removeId(tomorrowIds, tid), tid] }
  }

  return null
}

export function poolDragId(taskId) {
  return `${POOL}${taskId}`
}

export function parsePoolDragId(id) {
  const s = String(id)
  return s.startsWith(POOL) ? s.slice(POOL.length) : null
}
