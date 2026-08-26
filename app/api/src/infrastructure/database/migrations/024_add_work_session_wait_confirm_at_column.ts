import type { Database } from "bun:sqlite";

export function migrate(db: Database): void {
  const columns = db.prepare("PRAGMA table_info(workSessions)").all() as { name: string }[];

  if (!columns.some((c) => c.name === "waitConfirmAt")) {
    db.exec(`ALTER TABLE workSessions ADD COLUMN waitConfirmAt TEXT`);
  }
}
