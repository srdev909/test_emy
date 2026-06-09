<script setup lang="ts">
import { ref } from 'vue'

import TaskCard from '@/components/TaskCard.vue'
import type { ColumnDefinition, Task, TaskStatus } from '@/types/task'

interface Props {
  column: ColumnDefinition
  tasks: Task[]
  total: number
  isFiltering: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'add', status: TaskStatus): void
  (event: 'edit', task: Task): void
  (event: 'delete', task: Task): void
  (event: 'move', taskId: string, status: TaskStatus): void
}>()

const isDropTarget = ref(false)

function onDragOver(event: DragEvent): void {
  // Allow drop and indicate it visually.
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  isDropTarget.value = true
}

function onDragLeave(): void {
  isDropTarget.value = false
}

function onDrop(event: DragEvent): void {
  event.preventDefault()
  isDropTarget.value = false
  const taskId = event.dataTransfer?.getData('text/plain')
  if (taskId) emit('move', taskId, props.column.id)
}
</script>

<template>
  <article
    role="listitem"
    class="column"
    :class="{ 'column--drop-target': isDropTarget }"
    :style="{ '--column-accent': column.accent }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <header class="column__header">
      <div class="column__title-group">
        <span class="column__dot" aria-hidden="true"></span>
        <h2 class="column__title">{{ column.title }}</h2>
        <span class="column__count" :title="`${total} task(s) in this column`">
          {{ isFiltering ? `${tasks.length} / ${total}` : total }}
        </span>
      </div>
      <button
        type="button"
        class="btn btn--icon"
        :aria-label="`Add task to ${column.title}`"
        @click="emit('add', column.id)"
      >
        +
      </button>
    </header>

    <ul class="column__list">
      <li v-for="task in tasks" :key="task.id" class="column__item">
        <TaskCard
          :task="task"
          @edit="emit('edit', task)"
          @delete="emit('delete', task)"
          @move="(status) => emit('move', task.id, status)"
        />
      </li>
      <li v-if="tasks.length === 0" class="column__empty">
        <span v-if="isFiltering">No tasks match the current filter.</span>
        <span v-else>Drag tasks here or click + to add.</span>
      </li>
    </ul>
  </article>
</template>
