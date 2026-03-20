import { describe, it, expect } from 'vitest'
import { formatCombinedChatworkBody } from './reminder-messages'
import type { TaskReminderInput } from './types'

const t = (id: string, title: string, due: string, pj: string): TaskReminderInput => ({
  id,
  title,
  due,
  done: false,
  projectName: pj,
})

describe('reminder-messages', () => {
  it('複数バケットを1本文にまとめる', () => {
    const body = formatCombinedChatworkBody({
      three_days: [t('1', 'A', '2025-03-25', 'PJ')],
      one_day: [t('2', 'B', '2025-03-23', 'PJ')],
      due_today: [],
    })
    expect(body).toContain('3日後が期限')
    expect(body).toContain('明日が期限')
    expect(body).toContain('タスク: A')
  })
  it('空なら空文字に近い', () => {
    const body = formatCombinedChatworkBody({ three_days: [], one_day: [], due_today: [] })
    expect(body.trim().length).toBe(0)
  })
})
