# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Architecture

This project is a monorepo with two applications:
- **app/web:** Desktop frontend application (Tauri v2 + React)
- **app/api:** Local backend service (Bun + TypeScript + SQLite), compiled via `bun build --compile` into a standalone native executable and run as a Tauri sidecar process

The frontend and backend communicate over a local-only HTTP API on `127.0.0.1`, exposed by the `app/api` sidecar (default port `4287`, overridable via `API_PORT`). Tauri's own `invoke()` bridge is reserved for OS-native concerns (file dialogs, window/tray, notifications), not data calls. In dev mode, `app/api` runs directly via `bun run --watch` for hot reload; only packaged/release builds spawn the compiled sidecar binary (see `src-tauri/src/lib.rs`). Note: Tauri's build script validates that the `externalBin` resource file exists on disk at compile time regardless of dev/release mode, so `mise run dev` compiles the host-platform sidecar first even though dev mode doesn't run it. All data persists locally in SQLite. No remote server or authentication is used.

**Dev Tools:** Install [mise](https://mise.jdx.dev), then use `mise run <task>` for all development commands — mise installs Bun into its own tool directory rather than your system `PATH`, so bare `bun`/`bunx` calls fail unless you've run `mise activate` for your shell. Package manager: [bun](https://bun.sh) (Bun workspaces: `app/web`, `app/api`). mise also manages the Rust toolchain, required to compile the Tauri shell (app logic itself stays TypeScript). See `docs/MISE_COMMANDS.md` and `docs/BUN_COMMANDS.md` for references.

## Commands

| Command | Description |
| --- | --- |
| `mise install` | Install pinned tool versions (Bun, Rust). |
| `mise run install` | Install JS dependencies for both `app/web` and `app/api`. |
| `mise run dev` | Launch the full app: Tauri window + Vite dev server + API dev server. |
| `mise run dev:services` | Launch just the Vite (`:1420`) and API (`:4287`) dev servers, without the Tauri window — use for browser-only iteration that doesn't touch Tauri-native concerns. |
| `mise run api:compile:host` | Compile `app/api` into a native sidecar binary for the current OS/arch. |
| `mise run build` | Compile the host sidecar, then produce a packaged Tauri app/installer. |
| `mise run typecheck` | Typecheck both `app/web` and `app/api`. |
| `mise run lint` | Lint both `app/web` and `app/api`. |
| `mise run test` | Run the `app/api` test suite (`bun test`, via `app/api`'s `test` script). |

Run `mise tasks` to list all available tasks at any time.

To run a single test file or test case, use Bun's test runner directly against `app/api` (there is no `mise` task for this):

```sh
bun run --cwd app/api test <path-to-test-file>
bun run --cwd app/api test -t "<test name>"
```

`app/web` has no test suite.

# Frontend (app/web)

**Tech Stack:** React 19 • TypeScript • TanStack Query • React Router • Zustand • Tailwind CSS v4 • Vite

Feature-based folder structure under `src/features/<feature>/`: `components/`, `hooks/`, `queries/` (TanStack Query hooks), `store/` (Zustand), `services/` (API calls via plain `fetch`), `types/`, `index.ts` (public exports). Current features: `assignments`, `calendar`, `courses`, `health`, `management`, `workSessions`. Shared cross-feature code lives in `src/shared/`; route-level pages in `src/pages/`; router setup in `src/router/`.

Alongside `src/` sits the sibling `src-tauri/` Rust project (the Tauri shell): `tauri.conf.json`, `Cargo.toml`, `capabilities/`, and `src/lib.rs`, which spawns the `app/api` sidecar on startup and terminates it on exit. There is no preload/`ipcRenderer` bridge — the frontend calls the backend via plain `fetch` inside each feature's `services/` layer (`src/shared/lib/apiClient.ts`).

**State Management:**
- **Zustand stores:** frontend UI state (filters, modals, UI toggles, sorting preferences)
- **TanStack Query:** server state, caching, and API call coordination with the backend

**Guidelines:**
- Keep features isolated; avoid cross-feature imports except through `shared/`
- Business logic belongs in services or backend, not in components
- Each feature is self-contained with its own types, queries, and state

Design system (colors, typography, spacing, component patterns) is documented in `docs/DESIGN_SYSTEM.md` — follow it for any UI work.

# Backend (app/api)

**Tech Stack:** Bun • TypeScript • SQLite (`bun:sqlite`) • Hono (HTTP layer)

Compiled into a standalone native executable for distribution (`bun build --compile`) — no Node.js or Bun runtime needs to be installed on the end user's machine. `bun:sqlite` is built into Bun itself, so there's no native-addon rebuild step across platforms.

**Architecture:** Clean Architecture with separation of concerns, one subfolder per entity under each layer:

```
src/
├── domain/                  (Entities, business rules, lifecycle guards — no framework or DB imports)
├── application/             (Use cases: orchestrate domain + infrastructure)
├── infrastructure/
│   ├── database/
│   │   ├── sqlite/          (bun:sqlite connection)
│   │   ├── migrations/      (numbered, sequential — see below)
│   │   ├── seeds/           (state-table seed data)
│   │   └── repositories/    (translate domain entities <-> DB rows)
│   └── http/                (Hono server, route handlers, CORS)
├── shared/
└── index.ts                 (entry point / DI wiring)
```

**Domain entities:** `Course`, `Assignment`, `AssignmentState`, `WorkSession`, `WorkSessionState`, `AssignmentWorkSession` (join entity linking assignments to work sessions). There is no `Event` or `Task` entity — both were dropped (migration `009_drop_event_and_task_tables.ts`) and superseded by `WorkSession` / `AssignmentWorkSession`. Don't reintroduce Event/Task-shaped assumptions when reading older docs or history.

**Assignment/WorkSession lifecycle:** Both `Assignment` and `WorkSession` carry `completedAt`, `wrapUpAt`, `rescheduleAt`, `isDeleted`/`deletedAt`. Each entity's lifecycle state (e.g. `UPCOMING` / `OVERDUE` / `COMPLETED` / `COMPLETED_OVERDUE` for Assignment) is *derived*, not stored — computed from `completedAt`/`dueDate`/`now` by a `resolveLifecycle` function (see `domain/assignment/AssignmentLifecycle.ts`). Every mutating action (complete, uncomplete, edit, delete, reschedule, link, wrap up, wrap up late) is gated by an `assertCanX` guard that re-derives the current lifecycle state and throws a typed domain error if the transition isn't allowed from that state — guards live next to the entity and are exercised via a state x action truth table in `app/api/tests/`. Apply the same pattern (derive, then guard) when adding new lifecycle-sensitive behavior rather than storing a redundant status flag.

**Layer rules:**
- `domain/` never imports from `infrastructure/` or `application/`
- `application/` orchestrates; don't duplicate domain logic in use cases
- `repositories/` transform DB rows into domain entities and vice versa; domain entities never contain DB logic
- New DB schema changes go in a new sequentially-numbered file in `infrastructure/database/migrations/`, never by editing an existing migration

**Tests:** `app/api/tests/*.test.ts`, run via `bun:sqlite`'s bundled test runner (`bun test`). Shared fixtures/builders live in `app/api/tests/support/`.

# Plan mode

Only include the implementation plan and any risks or trade-offs. Skip background, context, and explanations — never write a "Context" section.

# Commits

Commit messages should be a clear title only. Skip the description/body. Never reference yourself (no Co-Authored-By, no mention of Claude/AI).
