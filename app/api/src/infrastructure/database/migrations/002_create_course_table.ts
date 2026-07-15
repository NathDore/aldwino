import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      color TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `);
}
