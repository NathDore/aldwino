import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS assignments (
      id TEXT PRIMARY KEY,
      courseId TEXT NOT NULL,
      eventId TEXT NOT NULL,
      description TEXT NOT NULL,
      dueDate TEXT NOT NULL,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      completedAt TEXT,
      createdAt TEXT NOT NULL
    )
  `);
}
