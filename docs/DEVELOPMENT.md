# Development Workflow

This guide walks through setting up your machine, starting the app locally, and the day-to-day commands you'll use while working on Aldwino. For the full command reference tables, see [MISE_COMMANDS.md](./MISE_COMMANDS.md) and [BUN_COMMANDS.md](./BUN_COMMANDS.md).

## 1. Prerequisites

Install [mise](https://mise.jdx.dev) — it manages the pinned tool versions for this repo (Bun and Rust), declared in `mise.toml` at the repo root. You don't need to install Bun or Rust yourself; mise handles that.

```sh
mise install
```

This reads `mise.toml` and installs the exact Bun and Rust versions the project expects.

## 2. Install dependencies

```sh
mise run install
```

This runs `bun install` at the repo root, which installs JS dependencies for both workspace packages (`app/web` and `app/api`) in one pass, since they're managed as [Bun workspaces](https://bun.sh/docs/install/workspaces).

## 3. Start the full app

```sh
mise run dev
```

This is the command you'll use for most day-to-day work. It:

1. Compiles `app/api` into a native sidecar binary for your host platform (`api:compile:host`). This step exists because Tauri's build script checks that the `externalBin` binary listed in `tauri.conf.json` exists on disk *at compile time*, even though dev mode doesn't actually run that binary — see the note below.
2. Runs `bunx tauri dev`, which opens the Tauri desktop window and, per `beforeDevCommand` in `src-tauri/tauri.conf.json`, also runs `bun run dev:services` in the background.

`dev:services` (defined in [`scripts/dev-services.ts`](../scripts/dev-services.ts)) is what actually starts your two servers together:

- **`app/web`**: `vite` dev server on `http://localhost:1420`
- **`app/api`**: `bun run --watch src/index.ts` on `http://127.0.0.1:4287` (or `$API_PORT` if set)

Both processes' output is prefixed (`[web]` / `[api]`) and interleaved in the same terminal, and both are killed together when you stop the parent process (Ctrl+C) or close the Tauri window.

**Why a compiled sidecar in dev mode, if dev mode doesn't run it?** In *release* builds, `app/api` isn't run via `bun run` — it's compiled ahead of time (`bun build --compile`) into a standalone native executable and bundled into the app as a Tauri "sidecar" process, so end users don't need Bun or Node installed at all (see `src-tauri/src/lib.rs`, which spawns it via `tauri_plugin_shell`). Tauri validates that this binary exists at *build* time regardless of dev/release mode, so `mise run dev` compiles it first just to satisfy that check — dev mode itself talks to the API through `bun run --watch`, not the compiled binary.

## 4. Run frontend + backend together without the Tauri window

If you're testing purely in a browser (no native window, no Tauri-specific APIs), you can skip Tauri entirely and run just the two dev servers with:

```sh
bun run dev:services
```

This runs the same `scripts/dev-services.ts` script described above — Vite on `:1420` and the API on `:4287` — as two concurrent processes under one command, with Ctrl+C stopping both. Open `http://localhost:1420` in a browser; the frontend's `fetch` calls to the API will work because `app/api`'s CORS config (`app/api/src/index.ts`) explicitly allows the `http://localhost:1420` origin.

Use this when:
- You want faster iteration without waiting on the Rust/Tauri window to rebuild or open
- You're testing a feature that doesn't touch Tauri-native concerns (file dialogs, window/tray, notifications)

Use `mise run dev` instead when you need the actual desktop shell, or are testing something that depends on Tauri's `invoke()` bridge.

## 5. Other commands you'll use often

| Command | When to use it |
| --- | --- |
| `mise run typecheck` | Before committing — typechecks both `app/web` and `app/api`. |
| `mise run lint` | Before committing — lints both packages. |
| `mise run build` | To produce a real installer/bundle (compiles the sidecar, then runs `tauri build`). |

See [MISE_COMMANDS.md](./MISE_COMMANDS.md) for the complete task list and [BUN_COMMANDS.md](./BUN_COMMANDS.md) for running a single package in isolation (e.g. just the frontend, or just the backend).

## Summary: which command do I run?

| Goal | Command |
| --- | --- |
| First-time setup | `mise install` then `mise run install` |
| Full app with the desktop window | `mise run dev` |
| Frontend + backend only, in a browser | `bun run dev:services` |
| Just the frontend | `bun run --cwd app/web dev` |
| Just the backend | `bun run --cwd app/api dev` |
| Check types / lint before committing | `mise run typecheck` / `mise run lint` |
| Produce a distributable build | `mise run build` |
