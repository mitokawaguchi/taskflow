import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { upsertDailyPlanner } from '../../api/dailyPlanner'
import { isRelevantForTodayViewTask, partitionTasksIntoWeekSections } from '../../utils/weekTasksScope'
import { applyPlannerDragEnd } from './applyPlannerDrag'
import { DropColumn, SortableRow } from './DailyPlannerParts'
import DailyPlannerPool from './DailyPlannerPool'
import { usePlannerTaskRegistry } from './usePlannerTaskRegistry'

function useDebounced(fn, ms) {
  const t = useRef(null)
  return useCallback(
    (arg) => {
      if (t.current) clearTimeout(t.current)
      t.current = setTimeout(() => {
        fn(arg)
      }, ms)
    },
    [fn, ms]
  )
}

export default function DailyPlannerPage({
  allTasks,
  tasksForPool,
  dailyPlanner,
  setDailyPlanner,
  focusSide,
  projects,
  categories,
  users,
  projectsMap,
  usersMap,
  onToggleTask,
  onEditTask,
  addToast,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const saveDebounced = useDebounced((p) => {
    upsertDailyPlanner(p).catch((e) => addToast('❌', '保存に失敗しました', e?.message ?? ''))
  }, 450)

  const { todayTaskIds, tomorrowTaskIds } = dailyPlanner
  const tasksById = usePlannerTaskRegistry(allTasks, setDailyPlanner)

  const { poolSections, poolOthers } = useMemo(() => {
    const ranked = new Set([...todayTaskIds, ...tomorrowTaskIds])
    const base = tasksForPool.filter((t) => !t.done)
    const notRanked = base.filter((t) => !ranked.has(t.id))
    const weekScoped = notRanked.filter((t) => isRelevantForTodayViewTask(t))
    const others = notRanked.filter((t) => !isRelevantForTodayViewTask(t))
    return { poolSections: partitionTasksIntoWeekSections(weekScoped), poolOthers: others }
  }, [tasksForPool, todayTaskIds, tomorrowTaskIds])

  const onDragEnd = useCallback(
    (e) => {
      const next = applyPlannerDragEnd(e, dailyPlanner)
      if (next) {
        const full = { ...next, plannerAnchorYmd: dailyPlanner.plannerAnchorYmd ?? null }
        setDailyPlanner(full)
        saveDebounced(full)
      }
    },
    [dailyPlanner, setDailyPlanner, saveDebounced]
  )

  const [activeId, setActiveId] = useState(null)
  const activeTask = useMemo(() => {
    if (activeId == null) return null
    const s = String(activeId)
    const id = s.startsWith('pool-') ? s.slice(5) : s
    return tasksById.get(id) ?? null
  }, [activeId, tasksById])

  const colToday = useMemo(
    () =>
      todayTaskIds
        .map((id, i) => {
          const t = tasksById.get(id)
          if (!t) return null
          return (
            <SortableRow
              key={id}
              id={id}
              task={t}
              label={`${i + 1}`}
              projects={projects}
              categories={categories}
              users={users}
              projectsMap={projectsMap}
              usersMap={usersMap}
              onToggle={onToggleTask}
              onEdit={onEditTask}
            />
          )
        })
        .filter(Boolean),
    [todayTaskIds, tasksById, projects, categories, users, projectsMap, usersMap, onToggleTask, onEditTask]
  )

  const colTomorrow = useMemo(
    () =>
      tomorrowTaskIds
        .map((id, i) => {
          const t = tasksById.get(id)
          if (!t) return null
          return (
            <SortableRow
              key={id}
              id={id}
              task={t}
              label={`${i + 1}`}
              projects={projects}
              categories={categories}
              users={users}
              projectsMap={projectsMap}
              usersMap={usersMap}
              onToggle={onToggleTask}
              onEdit={onEditTask}
            />
          )
        })
        .filter(Boolean),
    [tomorrowTaskIds, tasksById, projects, categories, users, projectsMap, usersMap, onToggleTask, onEditTask]
  )

  const refTomorrow = useRef(null)
  const refToday = useRef(null)
  useEffect(() => {
    if (focusSide === 'tomorrow') refTomorrow.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (focusSide === 'today') refToday.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [focusSide])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(ev) => setActiveId(ev.active.id)}
      onDragEnd={(ev) => {
        onDragEnd(ev)
        setActiveId(null)
      }}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="daily-planner">
        <p className="daily-planner__hint text-muted">
          カードのどこをつかんでもドラッグできます。下の一覧から上の列へ並べます（左が明日・右が今日）。列からプールへ戻すときは、プール見出しのすぐ下のエリアへドロップできます。
        </p>
        <div className="daily-planner__top">
          <div ref={refTomorrow}>
            <DropColumn zoneId="tomorrow-zone" title="明日">
              <SortableContext items={tomorrowTaskIds} strategy={verticalListSortingStrategy}>
                <div className="daily-planner__rank-list">{colTomorrow}</div>
              </SortableContext>
            </DropColumn>
          </div>
          <div ref={refToday}>
            <DropColumn zoneId="today-zone" title="今日">
              <SortableContext items={todayTaskIds} strategy={verticalListSortingStrategy}>
                <div className="daily-planner__rank-list">{colToday}</div>
              </SortableContext>
            </DropColumn>
          </div>
        </div>

        <DailyPlannerPool
          poolSections={poolSections}
          poolOthers={poolOthers}
          projects={projects}
          categories={categories}
          users={users}
          projectsMap={projectsMap}
          usersMap={usersMap}
          onToggleTask={onToggleTask}
          onEditTask={onEditTask}
        />
      </div>
      <DragOverlay>{activeTask ? <div className="daily-planner__overlay">{activeTask.title}</div> : null}</DragOverlay>
    </DndContext>
  )
}
