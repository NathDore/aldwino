const targets: Record<string, { bunTarget: string; suffix: string }> = {
  "win32-x64": { bunTarget: "bun-windows-x64", suffix: "x86_64-pc-windows-msvc.exe" },
  "darwin-arm64": { bunTarget: "bun-darwin-arm64", suffix: "aarch64-apple-darwin" },
  "darwin-x64": { bunTarget: "bun-darwin-x64", suffix: "x86_64-apple-darwin" },
};

const key = `${process.platform}-${process.arch}`;
const target = targets[key];
if (!target) {
  throw new Error(`Unsupported host for sidecar compile: ${key}`);
}

const proc = Bun.spawn(
  [
    "bun",
    "build",
    "./src/index.ts",
    "--compile",
    `--target=${target.bunTarget}`,
    "--outfile",
    `../../src-tauri/binaries/app-api-${target.suffix}`,
  ],
  { stdout: "inherit", stderr: "inherit" },
);
process.exit(await proc.exited);

export {};
