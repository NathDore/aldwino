import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_workSessions_state_time
    ON workSessions(workSessionStateId, isDeleted, startTime, endTime)
  `);
}
