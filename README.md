# Aldwino

A desktop app built with Tauri v2 + React (frontend) and Bun + TypeScript + SQLite (local backend). All data stays on your machine — no account, no server, no login.

## Downloading a release

Grab the latest build from the [Releases page](../../releases). Pick the file that matches your OS:

- **Windows**: the `.msi` or `.exe` installer
- **macOS (Apple Silicon / M-series)**: the `aarch64` `.dmg`
- **macOS (Intel)**: the `x86_64` `.dmg`

These builds are not code-signed (no paid Apple Developer or Windows code-signing certificate), so your OS will flag them as coming from an unidentified developer. This is expected — here's how to open them anyway:

### Windows: SmartScreen warning
1. Run the installer. Windows will show "Windows protected your PC".
2. Click **More info**, then **Run anyway**.

### macOS: Gatekeeper warning
1. Open the `.dmg` and drag Aldwino into Applications.
2. Right-click (or Control-click) the app and choose **Open**, then confirm **Open** in the dialog. This is only needed the first time.
3. If macOS still refuses, run this in Terminal: `xattr -d com.apple.quarantine /Applications/Aldwino.app`

## Development

See [CLAUDE.md](CLAUDE.md) for architecture details and `docs/MISE_COMMANDS.md` / `docs/BUN_COMMANDS.md` for the dev command reference. Requires [mise](https://mise.jdx.dev) and [bun](https://bun.sh).
