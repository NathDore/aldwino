import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS assignmentStates (
      id TEXT PRIMARY KEY,
      state TEXT NOT NULL UNIQUE
    )
  `);
}
