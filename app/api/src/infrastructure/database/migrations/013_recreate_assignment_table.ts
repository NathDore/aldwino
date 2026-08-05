import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  const columns = db.prepare("PRAGMA table_info(assignments)").all() as { name: string }[];
  const hasOldShape = columns.some((c) => c.name === "eventId");
  const hasNewShape = columns.some((c) => c.name === "assignmentStateId");

  if (hasOldShape || !hasNewShape) {
    db.exec(`DROP TABLE IF EXISTS assignments`);
    db.exec(`
      CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        courseId TEXT NOT NULL,
        assignmentStateId TEXT NOT NULL,
        name TEXT NOT NULL,
        dueDate TEXT NOT NULL,
        completedAt TEXT,
        isDeleted INTEGER NOT NULL DEFAULT 0,
        deletedAt TEXT,
        createdAt TEXT NOT NULL
      )
    `);
  }
}
