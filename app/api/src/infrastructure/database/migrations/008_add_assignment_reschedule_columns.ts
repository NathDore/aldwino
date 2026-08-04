import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  const columns = db.prepare("PRAGMA table_info(assignments)").all() as { name: string }[];

  if (!columns.some((c) => c.name === "isReschedule")) {
    db.exec(`ALTER TABLE assignments ADD COLUMN isReschedule INTEGER NOT NULL DEFAULT 0`);
  }
  if (!columns.some((c) => c.name === "rescheduleAt")) {
    db.exec(`ALTER TABLE assignments ADD COLUMN rescheduleAt TEXT`);
  }
}
