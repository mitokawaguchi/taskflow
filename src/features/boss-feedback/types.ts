/** 上司指摘のカテゴリ（DB CHECK と一致） */
export const BOSS_FEEDBACK_CATEGORIES = [
  '誤字',
  '表現',
  '内容の精度',
  'フォーマット',
  'その他',
] as const

export type BossFeedbackCategory = (typeof BOSS_FEEDBACK_CATEGORIES)[number]

/** アプリ内で扱う指摘レコード */
export type BossFeedback = {
  id: string
  createdAt: string
  category: BossFeedbackCategory
  description: string
  exampleBefore: string | null
  exampleAfter: string | null
  projectName: string | null
  frequency: number
  memo: string | null
}

/** フォーム入力（未検証） */
export type BossFeedbackFormValues = {
  category: BossFeedbackCategory
  description: string
  exampleBefore: string
  exampleAfter: string
  projectName: string
  frequency: number
  memo: string
}
