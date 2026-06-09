import { TASK_STATUSES, type Task, type TaskStatus } from '@/types/task'

export const STORAGE_KEY = 'kanban-lite::tasks::v1'

/** Type-guard ensuring a value is a non-null object we can index into. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === 'string' && (TASK_STATUSES as readonly string[]).includes(value)
}

/**
 * Validates a single entry coming from localStorage. Unknown / malformed
 * fields cause the entry to be dropped so a corrupted storage value can never
 * crash the application.
 */
function parseTask(value: unknown): Task | null {
  if (!isRecord(value)) return null

  const { id, title, description, status, createdAt, updatedAt } = value
  if (typeof id !== 'string' || id.length === 0) return null
  if (typeof title !== 'string' || title.length === 0) return null
  if (!isTaskStatus(status)) return null
  if (typeof createdAt !== 'string' || typeof updatedAt !== 'string') return null

  return {
    id,
    title,
    description: typeof description === 'string' ? description : '',
    status,
    createdAt,
    updatedAt
  }
}

export function loadTasks(): Task[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map(parseTask)
      .filter((task): task is Task => task !== null)
  } catch (error) {
    console.error('[kanban-lite] Failed to load tasks from storage:', error)
    return []
  }
}

export function saveTasks(tasks: readonly Task[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    console.error('[kanban-lite] Failed to persist tasks:', error)
  }
}
