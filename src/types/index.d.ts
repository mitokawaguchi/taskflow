/** CODE-001: アプリで使う型定義。api.js → api.ts 変換時に import して使用 */

export type PriorityKey = 'critical' | 'high' | 'medium' | 'low'
export type StatusKey = 'todo' | 'in_progress' | 'review' | 'done'

/** プレモーテム1件（JSONB premortem_risks） */
export type PremortemRiskItem = { text: string }

export interface Task {
  id: string
  title: string
  desc: string
  purpose: string
  priority: PriorityKey
  projectId: string | null
  due: string
  done: boolean
  status: StatusKey
  startDate: string
  progress: number | null
  category: string | null
  assigneeId: string | null
  created: number
  /** 外コンOS: まず答えを置く */
  hypothesis: string | null
  /** 分 */
  timeboxMinutes: number | null
  premortemRisks: PremortemRiskItem[]
  nextTaskId: string | null
  completedAt: string | null
  timerStartedAt: string | null
}

/** 週次レビュー 1 行 */
export interface WeeklyReview {
  id: string
  ownerId: string
  weekStart: string
  weekEnd: string
  topAchievements: unknown[]
  wastedEfforts: unknown[]
  hypothesisResults: HypothesisResultItem[]
  nextWeekFocus: unknown[]
  growthNote: string | null
  createdAt: string
  updatedAt: string
}

export type HypothesisResultItem = {
  hypothesis: string
  result: 'hit' | 'miss' | 'partial'
  learning?: string
  taskId?: string
}

export interface Project {
  id: string
  name: string
  purpose: string
  color: string
  icon: string
  endDate: string
  sortOrder: number
}

export interface Template {
  id: string
  title: string
  desc: string
  priority: PriorityKey
}

export interface Client {
  id: string
  name: string
  color: string
  icon: string
}

export interface Remember {
  id: string
  clientId: string
  body: string
  created: number
}

export interface Category {
  id: string
  name: string
  color: string
}

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string
  created: number
}

/** メモ帳（プレーンテキスト + tldraw スナップショット） */
export interface Note {
  id: string
  title: string
  bodyText: string
  snapshot: unknown | null
  updatedAt: string
  createdAt: string
}
