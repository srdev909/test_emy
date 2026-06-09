<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef } from 'vue'

import { useTasksStore } from '@/stores/tasks'
import { TASK_STATUSES, type Task, type TaskStatus } from '@/types/task'

interface Props {
  mode: 'create' | 'edit'
  task: Task | null
  defaultStatus: TaskStatus
}

const props = defineProps<Props>()
const emit = defineEmits<{ (event: 'close'): void }>()

const store = useTasksStore()

const title = ref<string>(props.task?.title ?? '')
const description = ref<string>(props.task?.description ?? '')
const status = ref<TaskStatus>(props.task?.status ?? props.defaultStatus)
const error = ref<string>('')

const titleInput = useTemplateRef<HTMLInputElement>('titleInput')

const statusLabel: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done'
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  // Defer focus to next frame so the input is mounted.
  requestAnimationFrame(() => titleInput.value?.focus())
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

function submit(): void {
  const trimmedTitle = title.value.trim()
  if (trimmedTitle.length === 0) {
    error.value = 'Title is required.'
    return
  }
  try {
    if (props.mode === 'create') {
      store.addTask({
        title: trimmedTitle,
        description: description.value,
        status: status.value
      })
    } else if (props.task) {
      store.updateTask(props.task.id, {
        title: trimmedTitle,
        description: description.value,
        status: status.value
      })
    }
    emit('close')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Could not save the task.'
  }
}

function onBackdropClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) emit('close')
}
</script>

<template>
  <div
    class="modal"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="'task-form-title'"
    @mousedown="onBackdropClick"
  >
    <form class="modal__panel" @submit.prevent="submit">
      <header class="modal__header">
        <h2 id="task-form-title" class="modal__title">
          {{ mode === 'create' ? 'New task' : 'Edit task' }}
        </h2>
        <button type="button" class="btn btn--icon" aria-label="Close" @click="emit('close')">×</button>
      </header>

      <div class="modal__body">
        <label class="field">
          <span class="field__label">Title <span class="field__required">*</span></span>
          <input
            ref="titleInput"
            v-model="title"
            class="field__input"
            type="text"
            maxlength="120"
            required
            autocomplete="off"
          />
        </label>

        <label class="field">
          <span class="field__label">Description</span>
          <textarea
            v-model="description"
            class="field__input field__input--textarea"
            rows="4"
            maxlength="1000"
          ></textarea>
        </label>

        <label class="field">
          <span class="field__label">Status</span>
          <select v-model="status" class="field__input">
            <option v-for="value in TASK_STATUSES" :key="value" :value="value">
              {{ statusLabel[value] }}
            </option>
          </select>
        </label>

        <p v-if="error" class="field__error" role="alert">{{ error }}</p>
      </div>

      <footer class="modal__footer">
        <button type="button" class="btn btn--ghost" @click="emit('close')">Cancel</button>
        <button type="submit" class="btn btn--primary">
          {{ mode === 'create' ? 'Create task' : 'Save changes' }}
        </button>
      </footer>
    </form>
  </div>
</template>
