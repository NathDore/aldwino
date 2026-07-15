import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      startDateTime TEXT NOT NULL,
      endDateTime TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);
}
