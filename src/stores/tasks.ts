import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import {
  COLUMN_DEFINITIONS,
  type NewTaskInput,
  type Task,
  type TaskFilters,
  type TaskStatus,
  type TaskUpdate
} from '@/types/task'
import { createId } from '@/utils/id'
import { nowIso } from '@/utils/date'
import { loadTasks, saveTasks } from '@/utils/storage'

/**
 * Central Pinia store for the Kanban board.
 *
 * Design notes:
 * - Setup-store syntax keeps the Composition API ergonomics and lets us use
 *   `watch` directly to persist changes.
 * - State is hydrated once at construction time from localStorage; any
 *   subsequent mutation is automatically persisted by a deep watcher.
 * - Filters are part of the store so that they can be shared across the
 *   filter bar and the board view without prop drilling.
 */
export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>(loadTasks())

  const filters = ref<TaskFilters>({
    search: '',
    status: 'all'
  })

  // -- Persistence -----------------------------------------------------------
  watch(
    tasks,
    (next) => {
      saveTasks(next)
    },
    { deep: true }
  )

  // -- Getters ---------------------------------------------------------------
  const filteredTasks = computed<Task[]>(() => {
    const needle = filters.value.search.trim().toLowerCase()
    const statusFilter = filters.value.status

    return tasks.value.filter((task) => {
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false
      }
      if (needle.length === 0) return true
      return (
        task.title.toLowerCase().includes(needle) ||
        task.description.toLowerCase().includes(needle)
      )
    })
  })

  const tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      'todo': [],
      'in-progress': [],
      'done': []
    }
    for (const task of filteredTasks.value) {
      grouped[task.status].push(task)
    }
    return grouped
  })

  const totalsByStatus = computed<Record<TaskStatus, number>>(() => {
    const totals: Record<TaskStatus, number> = {
      'todo': 0,
      'in-progress': 0,
      'done': 0
    }
    for (const task of tasks.value) {
      totals[task.status] += 1
    }
    return totals
  })

  const isFiltering = computed<boolean>(
    () => filters.value.search.trim().length > 0 || filters.value.status !== 'all'
  )

  // -- Mutations -------------------------------------------------------------
  function addTask(input: NewTaskInput): Task {
    const title = input.title.trim()
    if (title.length === 0) {
      throw new Error('Task title is required')
    }
    const timestamp = nowIso()
    const task: Task = {
      id: createId(),
      title,
      description: (input.description ?? '').trim(),
      status: input.status ?? 'todo',
      createdAt: timestamp,
      updatedAt: timestamp
    }
    tasks.value.unshift(task)
    return task
  }

  function updateTask(id: string, update: TaskUpdate): void {
    const task = tasks.value.find((entry) => entry.id === id)
    if (!task) return
    if (typeof update.title === 'string') {
      const nextTitle = update.title.trim()
      if (nextTitle.length === 0) {
        throw new Error('Task title is required')
      }
      task.title = nextTitle
    }
    if (typeof update.description === 'string') {
      task.description = update.description.trim()
    }
    if (update.status) {
      task.status = update.status
    }
    task.updatedAt = nowIso()
  }

  function moveTask(id: string, status: TaskStatus): void {
    const task = tasks.value.find((entry) => entry.id === id)
    if (!task || task.status === status) return
    task.status = status
    task.updatedAt = nowIso()
  }

  function deleteTask(id: string): void {
    const index = tasks.value.findIndex((entry) => entry.id === id)
    if (index !== -1) tasks.value.splice(index, 1)
  }

  function setSearch(value: string): void {
    filters.value.search = value
  }

  function setStatusFilter(value: TaskFilters['status']): void {
    filters.value.status = value
  }

  function resetFilters(): void {
    filters.value.search = ''
    filters.value.status = 'all'
  }

  return {
    // state
    tasks,
    filters,
    // getters
    filteredTasks,
    tasksByStatus,
    totalsByStatus,
    isFiltering,
    columns: COLUMN_DEFINITIONS,
    // actions
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    setSearch,
    setStatusFilter,
    resetFilters
  }
})
