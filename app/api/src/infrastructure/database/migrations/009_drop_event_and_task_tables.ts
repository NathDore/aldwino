import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  db.exec(`DROP TABLE IF EXISTS events`);
  db.exec(`DROP TABLE IF EXISTS tasks`);
}
