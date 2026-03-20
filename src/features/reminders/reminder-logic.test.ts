import { describe, it, expect } from 'vitest'
import {
  daysUntilDue,
  bucketForDaysUntilDue,
  classifyReminderTasks,
  hasNoReminders,
} from './reminder-logic'

const baseTask = (over: Partial<{ id: string; title: string; due: string | null; done: boolean; projectName: string }>) => ({
  id: 't1',
  title: 'T',
  due: '2025-03-25',
  done: false,
  projectName: 'PJ',
  ...over,
})

describe('reminder-logic', () => {
  it('daysUntilDue: 3日後は 3', () => {
    expect(daysUntilDue('2025-03-22', '2025-03-25')).toBe(3)
  })
  it('daysUntilDue: 翌日は 1', () => {
    expect(daysUntilDue('2025-03-24', '2025-03-25')).toBe(1)
  })
  it('daysUntilDue: 当日は 0', () => {
    expect(daysUntilDue('2025-03-25', '2025-03-25')).toBe(0)
  })
  it('期限が過去のタスクは分類されない', () => {
    const c = classifyReminderTasks([baseTask({ due: '2025-01-01' })], '2025-03-25')
    expect(hasNoReminders(c)).toBe(true)
  })
  it('期限 null のタスクはスキップ', () => {
    const c = classifyReminderTasks([baseTask({ due: null })], '2025-03-25')
    expect(hasNoReminders(c)).toBe(true)
  })
  it('完了タスクはスキップ', () => {
    const c = classifyReminderTasks([baseTask({ done: true, due: '2025-03-25' })], '2025-03-25')
    expect(hasNoReminders(c)).toBe(true)
  })
  it('3日前・1日前・当日に正しく分類', () => {
    const today = '2025-03-22'
    const c = classifyReminderTasks(
      [
        baseTask({ id: 'a', title: 'A', due: '2025-03-25', projectName: 'P1' }),
        baseTask({ id: 'b', title: 'B', due: '2025-03-23', projectName: 'P2' }),
        baseTask({ id: 'c', title: 'C', due: '2025-03-22', projectName: 'P3' }),
      ],
      today
    )
    expect(c.three_days).toHaveLength(1)
    expect(c.three_days[0].id).toBe('a')
    expect(c.one_day).toHaveLength(1)
    expect(c.one_day[0].id).toBe('b')
    expect(c.due_today).toHaveLength(1)
    expect(c.due_today[0].id).toBe('c')
  })
  it('境界: 2日後は対象外', () => {
    const c = classifyReminderTasks([baseTask({ due: '2025-03-24' })], '2025-03-22')
    expect(hasNoReminders(c)).toBe(true)
  })
  it('bucketForDaysUntilDue: 異常系に近い値は null', () => {
    expect(bucketForDaysUntilDue(2)).toBeNull()
    expect(bucketForDaysUntilDue(-1)).toBeNull()
  })
})
