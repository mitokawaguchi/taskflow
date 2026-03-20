import type { BossFeedback } from './types'

/** カテゴリで絞り込み（「すべて」はフィルタなし） */
export function filterBossFeedbackByCategory(
  items: BossFeedback[],
  category: string
): BossFeedback[] {
  if (category === 'all') return items
  return items.filter((r) => r.category === category)
}

/** 指摘本文に部分一致（大文字小文字は区別しない） */
export function filterBossFeedbackByDescription(
  items: BossFeedback[],
  query: string
): BossFeedback[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  return items.filter((r) => r.description.toLowerCase().includes(q))
}

/** frequency で並べ替え */
export function sortBossFeedbackByFrequency(
  items: BossFeedback[],
  descending: boolean
): BossFeedback[] {
  const copy = [...items]
  copy.sort((a, b) =>
    descending ? b.frequency - a.frequency : a.frequency - b.frequency
  )
  return copy
}
