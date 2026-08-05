import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS workSessions (
      id TEXT PRIMARY KEY,
      workSessionStateId TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      completedAt TEXT,
      isDeleted INTEGER NOT NULL DEFAULT 0,
      deletedAt TEXT,
      createdAt TEXT NOT NULL
    )
  `);
}
