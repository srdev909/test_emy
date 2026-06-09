<script setup lang="ts">
import { ref } from 'vue'

import FilterBar from '@/components/FilterBar.vue'
import KanbanColumn from '@/components/KanbanColumn.vue'
import TaskFormModal from '@/components/TaskFormModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import { useTasksStore } from '@/stores/tasks'
import type { Task, TaskStatus } from '@/types/task'

const store = useTasksStore()

type FormState =
  | { mode: 'closed' }
  | { mode: 'create'; defaultStatus: TaskStatus }
  | { mode: 'edit'; task: Task }

const formState = ref<FormState>({ mode: 'closed' })
const taskToDelete = ref<Task | null>(null)

function openCreate(status: TaskStatus = 'todo'): void {
  formState.value = { mode: 'create', defaultStatus: status }
}

function openEdit(task: Task): void {
  formState.value = { mode: 'edit', task }
}

function closeForm(): void {
  formState.value = { mode: 'closed' }
}

function requestDelete(task: Task): void {
  taskToDelete.value = task
}

function confirmDelete(): void {
  if (taskToDelete.value) {
    store.deleteTask(taskToDelete.value.id)
    taskToDelete.value = null
  }
}

function cancelDelete(): void {
  taskToDelete.value = null
}
</script>

<template>
  <section class="board">
    <FilterBar @create="openCreate('todo')" />

    <div class="board__columns" role="list">
      <KanbanColumn
        v-for="column in store.columns"
        :key="column.id"
        :column="column"
        :tasks="store.tasksByStatus[column.id]"
        :total="store.totalsByStatus[column.id]"
        :is-filtering="store.isFiltering"
        @add="openCreate(column.id)"
        @edit="openEdit"
        @delete="requestDelete"
        @move="(taskId, status) => store.moveTask(taskId, status)"
      />
    </div>

    <TaskFormModal
      v-if="formState.mode !== 'closed'"
      :mode="formState.mode"
      :task="formState.mode === 'edit' ? formState.task : null"
      :default-status="formState.mode === 'create' ? formState.defaultStatus : 'todo'"
      @close="closeForm"
    />

    <ConfirmDialog
      v-if="taskToDelete"
      title="Delete task?"
      :message="`This will permanently remove “${taskToDelete.title}”. This action cannot be undone.`"
      confirm-label="Delete"
      cancel-label="Cancel"
      variant="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </section>
</template>
