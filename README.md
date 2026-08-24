# Aldwino

Aldwino is an app for managing your academic session. It currently handles courses and their assignments, with more on the way.

No internet connection needed. Completely free.

## Why

I built Aldwino for myself, to stay on top of my own coursework and actually get more done. Aldwino runs entirely on my machine: open it, add courses and assignments, and get to work. No sign-up, no syncing, nothing running in the background.

It's worked well enough for me that I decided to share it, in case it helps someone else stay organized too.

## Features

- **Courses** — organize your classes, each with its own color
- **Assignments** — due dates, completion tracking, reschedule when plans change
- **Calendar & Work Sessions** — block out time to actually work on assignments, not just list them
- **100% offline** — no account, no network calls, no cost

More features (beyond courses and assignments) are planned.

## Tech Stack

**Frontend** — React 19 · TypeScript · TanStack Query · Zustand · React Router · Tailwind CSS v4 · Vite, wrapped in **Tauri v2** for the native desktop shell.

**Backend** — Bun · TypeScript · SQLite (`bun:sqlite`) · Hono, compiled with `bun build --compile` into a standalone native executable and run as a Tauri sidecar process — no separate runtime needs to be installed to use the app.

The frontend and backend talk over a local-only HTTP API on `127.0.0.1`. Tauri's native bridge is reserved for OS-level concerns (file dialogs, window/tray, notifications) — not for app data.

## Architecture

The backend follows **Clean Architecture**, keeping business rules independent of frameworks and the database:

```
domain/          entities + business rules — no framework or DB imports
application/     use cases that orchestrate domain + infrastructure
infrastructure/  SQLite repositories, migrations, HTTP routes
```

Assignment statuses (upcoming, overdue, completed...) are always calculated from the assignment's actual due date and completion time rather than stored separately, so they're always accurate and can't get out of sync. See [docs/ASSIGNMENT_LIFECYCLE.md](docs/ASSIGNMENT_LIFECYCLE.md) for details.

## Getting Started

Requires [mise](https://mise.jdx.dev) to install the pinned Bun and Rust versions.

```sh
mise install
mise run install
mise run dev
```

See [docs/SET_UP_DEV.md](docs/SET_UP_DEV.md) for the full development workflow.

## Project Structure

```
app/
├── web/        Tauri + React desktop frontend
└── api/        Bun + SQLite backend, run as a Tauri sidecar
docs/           Architecture, stack, and command references
```

## Downloading a release

Grab the latest build from the [Releases page](../../releases).
