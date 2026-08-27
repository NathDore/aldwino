import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  const columns = db.prepare("PRAGMA table_info(notifications)").all() as { name: string }[];

  if (!columns.some((c) => c.name === "actionTaken")) {
    db.exec(`ALTER TABLE notifications ADD COLUMN actionTaken INTEGER NOT NULL DEFAULT 0`);
  }
}
