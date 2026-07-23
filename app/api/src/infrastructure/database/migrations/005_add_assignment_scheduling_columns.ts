import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  const columns = db.prepare("PRAGMA table_info(assignments)").all() as { name: string }[];

  if (!columns.some((c) => c.name === "startTime")) {
    db.exec(`ALTER TABLE assignments ADD COLUMN startTime TEXT`);
  }
  if (!columns.some((c) => c.name === "expectedDurationMinutes")) {
    db.exec(`ALTER TABLE assignments ADD COLUMN expectedDurationMinutes INTEGER`);
  }
}
