import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS assignmentWorkSessions (
      id TEXT PRIMARY KEY,
      assignmentId TEXT NOT NULL,
      workSessionId TEXT NOT NULL,
      isDeleted INTEGER NOT NULL DEFAULT 0,
      deletedAt TEXT,
      createdAt TEXT NOT NULL
    )
  `);
}
