<script setup lang="ts">
import BoardView from '@/components/BoardView.vue'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="app-header__brand">
        <span class="app-logo" aria-hidden="true">
          <span class="app-logo__bar app-logo__bar--a"></span>
          <span class="app-logo__bar app-logo__bar--b"></span>
          <span class="app-logo__bar app-logo__bar--c"></span>
        </span>
        <div>
          <h1 class="app-title">Kanban Lite</h1>
          <p class="app-subtitle">A lightweight task board built with Vue 3, Pinia and TypeScript</p>
        </div>
      </div>
    </header>
    <main class="app-main">
      <BoardView />
    </main>
  </div>
</template>
