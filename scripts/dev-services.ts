const services = [
  { name: "web", cwd: "app/web" },
  { name: "api", cwd: "app/api" },
];

const children = services.map(({ name, cwd }) => {
  const proc = Bun.spawn(["bun", "run", "dev"], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    env: process.env,
  });
  pipePrefixed(proc.stdout, name);
  pipePrefixed(proc.stderr, name);
  return proc;
});

async function pipePrefixed(stream: ReadableStream<Uint8Array>, name: string) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      console.log(`[${name}] ${line}`);
    }
  }
  if (buffer) console.log(`[${name}] ${buffer}`);
}

function shutdown() {
  for (const child of children) child.kill();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await Promise.race(children.map((c) => c.exited));
shutdown();
