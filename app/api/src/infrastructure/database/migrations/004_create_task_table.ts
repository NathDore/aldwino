import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      assignmentId TEXT NOT NULL,
      description TEXT NOT NULL,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL
    )
  `);
}
