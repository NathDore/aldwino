# Mise Commands

All development commands run through [mise](https://mise.jdx.dev) tasks, defined in `mise.toml` at the repo root.

| Command | Description |
| --- | --- |
| `mise install` | Install pinned tool versions (Bun, Rust) declared in `mise.toml`. |
| `mise run install` | Install JS dependencies for both `app/web` and `app/api` via Bun. |
| `mise run dev` | Launch the full app: Tauri window + Vite dev server + API dev server. |
| `mise run api:compile:host` | Compile `app/api` into a native sidecar binary for your current OS/arch. |
| `mise run build` | Compile the host sidecar, then produce a packaged Tauri app/installer. |
| `mise run typecheck` | Typecheck both `app/web` and `app/api`. |
| `mise run lint` | Lint both `app/web` and `app/api`. |

Run `mise tasks` to list all available tasks at any time.
