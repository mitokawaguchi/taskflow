/** CODE-001: アプリで使う型定義。api.js → api.ts 変換時に import して使用 */

export type PriorityKey = 'critical' | 'high' | 'medium' | 'low'
export type StatusKey = 'todo' | 'in_progress' | 'review' | 'done'

export interface Task {
  id: string
  title: string
  desc: string
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
}

export interface Project {
  id: string
  name: string
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
