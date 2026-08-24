import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  const columns = db.prepare("PRAGMA table_info(assignmentWorkSessions)").all() as { name: string }[];

  if (!columns.some((c) => c.name === "detachReason")) {
    db.exec(`ALTER TABLE assignmentWorkSessions ADD COLUMN detachReason TEXT`);
  }
}
