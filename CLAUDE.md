# Architecture

This project is a monorepo with two applications:
- **app/web:** Desktop frontend application (Tauri v2 + React)
- **app/api:** Local backend service (Bun + TypeScript + SQLite), compiled via `bun build --compile` into a standalone native executable and run as a Tauri sidecar process

The frontend and backend communicate over a local-only HTTP API on `127.0.0.1`, exposed by the `app/api` sidecar (default port `4287`, overridable via `API_PORT`). Tauri's own `invoke()` bridge is reserved for OS-native concerns (file dialogs, window/tray, notifications), not data calls. In dev mode, `app/api` runs directly via `bun run --watch` for hot reload; only packaged/release builds spawn the compiled sidecar binary (see `src-tauri/src/lib.rs`). Note: Tauri's build script validates that the `externalBin` resource file exists on disk at compile time regardless of dev/release mode, so `mise run dev` compiles the host-platform sidecar first even though dev mode doesn't run it. All data persists locally in SQLite. No remote server or authentication is used.

**Dev Tools:** Install [mise](https://mise.jdx.dev), then use `mise run <task>` for all development commands. Package manager: [bun](https://bun.sh). mise also manages the Rust toolchain, required to compile the Tauri shell (app logic itself stays TypeScript). See `docs/MISE_COMMANDS.md` and `docs/BUN_COMMANDS.md` for references.

## Frontend (app/web)

**Tech Stack:** React • TypeScript • TanStack Query • React Router • Zustand • Tailwind CSS

**Folder Structure:**
```
src/
├── features/
│   ├── courses/
│   │   ├── components/      (Feature-specific React components)
│   │   ├── hooks/           (Custom React hooks)
│   │   ├── queries/         (TanStack Query hooks for API calls)
│   │   ├── store/           (Zustand stores for UI state)
│   │   ├── services/        (API communication layer)
│   │   ├── types/           (TypeScript types and interfaces)
│   │   └── index.ts         (Public exports)
│   ├── assignments/         (Same structure as courses)
│   └── common/
├── shared/                  (Shared utilities, constants, types)
├── pages/                   (Route-level page components)
├── router/                  (React Router setup)
└── index.tsx
```

Alongside `src/` sits the sibling `src-tauri/` Rust project (the Tauri shell): `tauri.conf.json`, `Cargo.toml`, `capabilities/`, and the code (`src/lib.rs`) that spawns the `app/api` sidecar on startup and terminates it on exit. There is no preload/`ipcRenderer` bridge — the frontend calls the backend via plain `fetch` inside each feature's `services/` layer.

**State Management:**
- **Zustand stores:** Manage frontend UI state (filters, modals, UI toggles, sorting preferences)
- **TanStack Query:** Manage server state, caching, and API call coordination with the backend

Example: Assignments list comes from TanStack Query cache (from backend API). Active filter for viewing comes from a Zustand store.

**Guidelines:**
- Keep features isolated; avoid cross-feature imports except through `shared/`
- Business logic belongs in services or backend, not in components
- Each feature is self-contained with its own types, queries, and state

## Backend (app/api)

**Tech Stack:** Bun • TypeScript • SQLite (`bun:sqlite`) • Hono (HTTP layer)

The backend is compiled into a standalone native executable for distribution (`bun build --compile`) — no Node.js or Bun runtime needs to be installed on the end user's machine. `bun:sqlite` is built into Bun itself, so there's no native-addon rebuild step across platforms.

**Architecture:** Clean Architecture with separation of concerns

```
src/
├── domain/                  (Core business logic, entities, business rules)
│   ├── course/
│   │   ├── Course.ts        (Entity)
│   │   └── CourseRules.ts   (Business rules)
│   └── assignment/
├── application/             (Use cases and workflows)
│   ├── course/
│   │   ├── CreateCourseUseCase.ts
│   │   └── ListCoursesUseCase.ts
│   └── assignment/
├── infrastructure/          (Database, external APIs, framework-specific code)
│   ├── database/
│   │   ├── sqlite/          (SQLite implementation, migrations)
│   │   └── repositories/    (Data access layer)
│   └── http/                (Hono HTTP server: route handlers, CORS, sidecar entrypoint)
├── shared/                  (Reusable utilities, constants, common types)
└── index.ts                 (Application entry point)
```

**Database:**
- **SQLite** for local persistence
- Migrations stored in `infrastructure/database/migrations/`
- Repositories in `infrastructure/database/repositories/` handle all database queries
- Domain entities should not contain database logic

**Layer Responsibilities:**
- **domain/:** Define Course, Event, and Assignment entities with validation rules. Course has no dates (id, name, color). Event carries time blocks (id, startDateTime, endDateTime). Assignment links to both course and event (id, courseId, eventId, description, dueDate, isCompleted, completedAt, createdAt). Calendar renders Events; each Event displays its contained Assignments with course metadata.
- **application/:** Use cases like "CreateEvent", "CreateAssignment", "ListUncompleteAssignments", "MarkAssignmentComplete". Orchestrates domain and infrastructure layers.
- **infrastructure/:** SQLite queries, migrations, HTTP route handlers. Translates between domain entities and database rows.

**Guidelines:**
- Domain layer should never import from infrastructure or application
- Application layer orchestrates; don't duplicate logic in use cases
- Repositories transform database rows into domain entities and vice versa

---

# Development Style

- Always use Plan Mode before implementing new features
- Break large tasks into small incremental steps
- Explain architectural decisions
- Suggest refactoring when appropriate

---

# Teaching Style

I'm learning software architecture.

When introducing a new concept:
1. **Explain why it exists** — The problem it solves
2. **Explain when to use it** — Situations where it applies
3. **Show an example** — Code snippet in this project
4. **Relate it to my current project** — How it applies here

Don't assume I already know advanced concepts.
