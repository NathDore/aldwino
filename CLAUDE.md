# Architecture

This project is a monorepo with two applications:
- **app/web:** Desktop frontend application (Tauri v2 + React)
- **app/api:** Local backend service (Bun + TypeScript + SQLite), compiled via `bun build --compile` into a standalone native executable and run as a Tauri sidecar process

The frontend and backend communicate over a local-only HTTP API on `127.0.0.1`, exposed by the `app/api` sidecar (default port `4287`, overridable via `API_PORT`). Tauri's own `invoke()` bridge is reserved for OS-native concerns (file dialogs, window/tray, notifications), not data calls. In dev mode, `app/api` runs directly via `bun run --watch` for hot reload; only packaged/release builds spawn the compiled sidecar binary (see `src-tauri/src/lib.rs`). Note: Tauri's build script validates that the `externalBin` resource file exists on disk at compile time regardless of dev/release mode, so `mise run dev` compiles the host-platform sidecar first even though dev mode doesn't run it. All data persists locally in SQLite. No remote server or authentication is used.

**Dev Tools:** Install [mise](https://mise.jdx.dev), then use `mise run <task>` for all development commands. Package manager: [bun](https://bun.sh). mise also manages the Rust toolchain, required to compile the Tauri shell (app logic itself stays TypeScript). See `docs/MISE_COMMANDS.md` and `docs/BUN_COMMANDS.md` for references.

# Plan mode

Only include the implementation plan and any risks or trade-offs. Skip background, context, and explanations — never write a "Context" section.

# Commits

Commit messages should be a clear title only. Skip the description/body. Never reference yourself (no Co-Authored-By, no mention of Claude/AI).
