<script setup lang="ts">
import { computed } from 'vue'

import { useTasksStore } from '@/stores/tasks'
import { TASK_STATUSES, type TaskStatus } from '@/types/task'

defineEmits<{
  (event: 'create'): void
}>()

const store = useTasksStore()

const searchModel = computed<string>({
  get: () => store.filters.search,
  set: (value) => store.setSearch(value)
})

const statusModel = computed<TaskStatus | 'all'>({
  get: () => store.filters.status,
  set: (value) => store.setStatusFilter(value)
})

const statusLabel: Record<TaskStatus, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done'
}
</script>

<template>
  <div class="filter-bar">
    <div class="filter-bar__group filter-bar__group--search">
      <label class="filter-bar__label" for="kanban-search">Search</label>
      <input
        id="kanban-search"
        v-model="searchModel"
        type="search"
        class="filter-bar__input"
        placeholder="Search by title or description"
        autocomplete="off"
      />
    </div>

    <div class="filter-bar__group">
      <label class="filter-bar__label" for="kanban-status">Status</label>
      <select id="kanban-status" v-model="statusModel" class="filter-bar__select">
        <option value="all">All</option>
        <option v-for="status in TASK_STATUSES" :key="status" :value="status">
          {{ statusLabel[status] }}
        </option>
      </select>
    </div>

    <div class="filter-bar__actions">
      <button
        v-if="store.isFiltering"
        type="button"
        class="btn btn--ghost"
        @click="store.resetFilters()"
      >
        Reset
      </button>
      <button type="button" class="btn btn--primary" @click="$emit('create')">
        <span aria-hidden="true">+</span> New task
      </button>
    </div>
  </div>
</template>
