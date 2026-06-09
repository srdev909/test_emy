# Kanban Lite

A small task-management board (Kanban) built with **Vue 3 (Composition API)**, **Pinia**, and **TypeScript**.

It supports creating, editing, deleting (with confirmation) and moving tasks across three columns (**To Do**, **In Progress**, **Done**), with text and status filtering and full `localStorage` persistence.

---

## Quick start

```bash
npm install
npm run dev
```

The dev server starts on http://127.0.0.1:5173 (also reachable as `http://localhost:5173`).

> The Vite server is explicitly bound to `127.0.0.1` in `vite.config.ts` to avoid the IPv4/IPv6 `localhost` resolution mismatch that can occur on Windows (Vite would otherwise bind only to `[::1]`, causing `ERR_CONNECTION_REFUSED` in browsers that resolve `localhost` to `127.0.0.1`).

Other scripts:

| Script              | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR                         |
| `npm run build`     | Type-check (`vue-tsc`) and create a production build       |
| `npm run preview`   | Preview the production build                               |
| `npm run type-check`| Run the TypeScript compiler in `--noEmit` mode             |

---

## Features

- **Three columns** — `To Do`, `In Progress`, `Done`
- **Add / edit / delete** tasks (delete requires confirmation)
- **Move tasks** across columns via either:
  - Native HTML5 **drag-and-drop**, with the target column highlighted while hovering
  - Accessible **chip buttons** on each card (keyboard-friendly fallback)
- **Filtering**:
  - Free-text search over title **and** description
  - Status filter (all / per column)
  - Per-column counters show `visible / total` while a filter is active
- **Persistence** — all tasks are stored in `localStorage` and rehydrated on reload
- **Responsive layout** with a light/dark theme that follows the OS preference
- **Strict TypeScript** — `strict: true`, `noImplicitAny: true`, and no usage of `any` anywhere in the codebase

---

## Project structure

```
src/
├── App.vue                       # App shell (header + main)
├── main.ts                       # Vue + Pinia bootstrap
├── assets/styles/main.css        # Global stylesheet (BEM-style classes, CSS variables)
├── types/
│   └── task.ts                   # Task / TaskStatus / Filters / Column definitions
├── utils/
│   ├── id.ts                     # UUID generator with fallback
│   ├── date.ts                   # ISO timestamps and formatting helpers
│   └── storage.ts                # localStorage load/save with schema validation
├── stores/
│   └── tasks.ts                  # Pinia store: state, getters, actions, persistence
└── components/
    ├── BoardView.vue             # Orchestrates columns + modals
    ├── FilterBar.vue             # Search + status filter + "New task" button
    ├── KanbanColumn.vue          # A single column; handles drop targets
    ├── TaskCard.vue              # A draggable task with edit/delete/move controls
    ├── TaskFormModal.vue         # Create/edit dialog
    └── ConfirmDialog.vue         # Generic accessible confirmation dialog
```

---

## Architectural decisions

### 1. Composition API with `<script setup>`

All components use `<script setup lang="ts">`. This gives the most concise component code, the best TypeScript inference (props/emits are declared with generics), and zero runtime overhead for prop declaration.

### 2. Pinia as the single source of truth

A single store (`useTasksStore`) owns:

- the task list (`tasks`),
- the active filters (`filters`),
- derived getters (`filteredTasks`, `tasksByStatus`, `totalsByStatus`, `isFiltering`),
- and all mutations (`addTask`, `updateTask`, `moveTask`, `deleteTask`, filter setters).

The store is written in **setup-store** style so it can use `watch` directly to implement persistence. Components only ever read from getters or call actions — they never mutate state directly, which keeps data flow predictable.

`tasksByStatus` is computed once per change and exposes the three columns as an object keyed by `TaskStatus`. This keeps `KanbanColumn` rendering O(1) per render and avoids per-column filtering inside templates.

### 3. Persistence layer

`utils/storage.ts` encapsulates `localStorage` I/O behind two functions: `loadTasks()` and `saveTasks()`. The reader **validates** every entry against the expected shape and drops anything malformed, so a corrupted or hand-edited storage value can never crash the app or pollute the runtime state with `any`-typed data.

The store hydrates from `loadTasks()` once at construction and persists changes via a single deep `watch` on `tasks`. This means every store mutation — no matter where it originates — is automatically saved, with no risk of forgetting to persist after a new action is added.

### 4. Strict typing, no `any`

- `tsconfig.json` enables `strict`, `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`.
- `TaskStatus` is a string-literal union derived from a single `as const` tuple (`TASK_STATUSES`), giving exhaustiveness checking and a single source of truth for both runtime iteration and types.
- All emits and props are declared with TypeScript generics (`defineProps<Props>()`, `defineEmits<{ ... }>()`).
- External / untrusted data (localStorage) is narrowed with explicit type guards (`isRecord`, `isTaskStatus`) instead of casts.

### 5. Component boundaries

- **`BoardView`** owns transient UI state — which modal is open and which task is pending deletion — but **does not** own data. Data lives in the store.
- **`KanbanColumn`** is a presentational component that knows nothing about persistence or other columns; it accepts a list of tasks and emits intent (`add`, `edit`, `delete`, `move`).
- **`TaskCard`** is fully self-contained and re-emits user intent up to the column.
- **`ConfirmDialog`** is intentionally generic so it can be reused for any future destructive action.

This keeps each component small, easy to test, and replaceable.

### 6. Accessibility & UX

- All dialogs use proper ARIA roles (`role="dialog"` / `role="alertdialog"`), are labelled by their title, close on `Escape`, and close on backdrop click.
- The create/edit form auto-focuses the title input.
- Drag-and-drop has an **accessible fallback**: every card exposes chip buttons that move it to either of the other two columns via keyboard or click.
- Drop targets are visually highlighted while a card is dragged over them.
- Counters in column headers show `visible / total` while a filter is active so users always understand what is being hidden.

### 7. Styling

A single hand-written CSS file using CSS custom properties drives theming (light/dark via `prefers-color-scheme`). Class naming follows a BEM-like convention (`.column__header`, `.task-card__title`) to keep selectors predictable without needing a CSS-in-JS layer.

---

## Tech stack

- **Vue** 3.5 (Composition API, `<script setup>`)
- **Pinia** 2.2
- **TypeScript** 5.6 (strict mode, no `any`)
- **Vite** 6 + `@vitejs/plugin-vue`
- **vue-tsc** for type-checking `.vue` files

No additional runtime dependencies — drag-and-drop uses the native HTML5 DnD API.
