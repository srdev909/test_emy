<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

interface Props {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'default'
})

const emit = defineEmits<{
  (event: 'confirm'): void
  (event: 'cancel'): void
}>()

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') emit('cancel')
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

function onBackdropClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) emit('cancel')
}
</script>

<template>
  <div
    class="modal"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="confirm-title"
    aria-describedby="confirm-message"
    @mousedown="onBackdropClick"
  >
    <div class="modal__panel modal__panel--narrow">
      <header class="modal__header">
        <h2 id="confirm-title" class="modal__title">{{ props.title }}</h2>
      </header>
      <div class="modal__body">
        <p id="confirm-message" class="modal__message">{{ props.message }}</p>
      </div>
      <footer class="modal__footer">
        <button type="button" class="btn btn--ghost" @click="emit('cancel')">
          {{ props.cancelLabel }}
        </button>
        <button
          type="button"
          class="btn"
          :class="props.variant === 'danger' ? 'btn--danger-solid' : 'btn--primary'"
          @click="emit('confirm')"
        >
          {{ props.confirmLabel }}
        </button>
      </footer>
    </div>
  </div>
</template>
