/**
 * Domain types for the Kanban board.
 *
 * `TaskStatus` is modelled as a string literal union so that it is exhaustive
 * at the type level. The companion `TASK_STATUSES` tuple is the single source
 * of truth used to iterate over columns in the UI and to validate persisted
 * data loaded from localStorage.
 */

export const TASK_STATUSES = ['todo', 'in-progress', 'done'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

/** Payload used when creating a new task (id/timestamps are generated). */
export interface NewTaskInput {
  title: string
  description?: string
  status?: TaskStatus
}

/** Payload used when editing an existing task. */
export interface TaskUpdate {
  title?: string
  description?: string
  status?: TaskStatus
}

export interface TaskFilters {
  search: string
  status: TaskStatus | 'all'
}

export interface ColumnDefinition {
  id: TaskStatus
  title: string
  accent: string
}

export const COLUMN_DEFINITIONS: readonly ColumnDefinition[] = [
  { id: 'todo', title: 'To Do', accent: '#6366f1' },
  { id: 'in-progress', title: 'In Progress', accent: '#f59e0b' },
  { id: 'done', title: 'Done', accent: '#10b981' }
] as const
