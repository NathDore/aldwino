import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  const columns = db.prepare("PRAGMA table_info(events)").all() as { name: string }[];

  if (!columns.some((c) => c.name === "isCompleted")) {
    db.exec(`ALTER TABLE events ADD COLUMN isCompleted INTEGER NOT NULL DEFAULT 1`);
  }
}
