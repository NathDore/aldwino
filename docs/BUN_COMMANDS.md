# Bun Commands

[Bun](https://bun.sh) is the package manager and JS runtime for this monorepo (Bun workspaces: `app/web`, `app/api`).

| Command | Description |
| --- | --- |
| `bun install` | Install dependencies for all workspace packages. |
| `bun run --cwd app/web dev` | Run only the frontend Vite dev server (port 1420). |
| `bun run --cwd app/api dev` | Run only the backend API server in watch mode (port 4287, or `$API_PORT`). |
| `bun run --cwd app/api compile:host` | Compile the backend into a native sidecar executable for your current OS/arch. |
| `bun run --cwd app/web build` | Build the frontend for production (output consumed by Tauri as `frontendDist`). |

Note: `--cwd` must come *after* `run` (`bun run --cwd <dir> <script>`) — putting it before `run` silently prints Bun's help instead of running the script.

Prefer the equivalent `mise run <task>` commands (see [MISE_COMMANDS.md](./MISE_COMMANDS.md)) for anything that spans both packages or the Tauri shell.
