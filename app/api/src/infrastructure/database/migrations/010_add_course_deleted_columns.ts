import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  const columns = db.prepare("PRAGMA table_info(courses)").all() as { name: string }[];

  if (!columns.some((c) => c.name === "isDeleted")) {
    db.exec(`ALTER TABLE courses ADD COLUMN isDeleted INTEGER NOT NULL DEFAULT 0`);
  }
  if (!columns.some((c) => c.name === "deletedAt")) {
    db.exec(`ALTER TABLE courses ADD COLUMN deletedAt TEXT`);
  }
}
