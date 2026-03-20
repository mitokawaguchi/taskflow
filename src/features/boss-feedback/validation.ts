import { BOSS_FEEDBACK_CATEGORIES, type BossFeedbackCategory, type BossFeedbackFormValues } from './types'

function isCategory(v: string): v is BossFeedbackCategory {
  return (BOSS_FEEDBACK_CATEGORIES as readonly string[]).includes(v)
}

/** フォーム送信前の検証（description 必須・frequency は 1 以上） */
export function validateBossFeedbackForm(
  raw: BossFeedbackFormValues
): { ok: true; values: BossFeedbackFormValues } | { ok: false; error: string } {
  if (!raw.description.trim()) {
    return { ok: false, error: '指摘内容（説明）は必須です' }
  }
  if (!isCategory(raw.category)) {
    return { ok: false, error: 'カテゴリが不正です' }
  }
  const fr = raw.frequency
  if (!Number.isInteger(fr) || fr < 1) {
    return { ok: false, error: '回数は 1 以上の整数にしてください' }
  }
  return {
    ok: true,
    values: {
      category: raw.category,
      description: raw.description.trim(),
      exampleBefore: raw.exampleBefore.trim() || '',
      exampleAfter: raw.exampleAfter.trim() || '',
      projectName: raw.projectName.trim() || '',
      frequency: fr,
      memo: raw.memo.trim() || '',
    },
  }
}
