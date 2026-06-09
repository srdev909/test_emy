<script setup lang="ts">
import { computed } from 'vue'

import { TASK_STATUSES, type Task, type TaskStatus } from '@/types/task'
import { formatTimestamp } from '@/utils/date'

interface Props {
  task: Task
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'edit'): void
  (event: 'delete'): void
  (event: 'move', status: TaskStatus): void
}>()

const otherStatuses = computed<TaskStatus[]>(() =>
  TASK_STATUSES.filter((status) => status !== props.task.status)
)

const statusLabel: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done'
}

function onDragStart(event: DragEvent): void {
  if (!event.dataTransfer) return
  event.dataTransfer.setData('text/plain', props.task.id)
  event.dataTransfer.effectAllowed = 'move'
}
</script>

<template>
  <article
    class="task-card"
    :draggable="true"
    :aria-label="`Task: ${task.title}`"
    @dragstart="onDragStart"
  >
    <header class="task-card__header">
      <h3 class="task-card__title">{{ task.title }}</h3>
      <div class="task-card__actions">
        <button
          type="button"
          class="btn btn--icon btn--icon-sm"
          aria-label="Edit task"
          title="Edit"
          @click="emit('edit')"
        >
          ✎
        </button>
        <button
          type="button"
          class="btn btn--icon btn--icon-sm btn--danger"
          aria-label="Delete task"
          title="Delete"
          @click="emit('delete')"
        >
          ×
        </button>
      </div>
    </header>

    <p v-if="task.description" class="task-card__description">{{ task.description }}</p>

    <footer class="task-card__footer">
      <div class="task-card__meta">
        <span class="task-card__timestamp" :title="`Created ${formatTimestamp(task.createdAt)}`">
          Updated {{ formatTimestamp(task.updatedAt) }}
        </span>
      </div>
      <div class="task-card__move" role="group" aria-label="Move task">
        <button
          v-for="status in otherStatuses"
          :key="status"
          type="button"
          class="btn btn--chip"
          :title="`Move to ${statusLabel[status]}`"
          @click="emit('move', status)"
        >
          {{ statusLabel[status] }}
        </button>
      </div>
    </footer>
  </article>
</template>
