import { Database } from "bun:sqlite";
import path from "path";

let db: Database | null = null;

export function getDatabase(): Database {
  if (db === null) {
    const dbPath = path.join(process.cwd(), "aldwino.db");
    db = new Database(dbPath);
  }
  return db;
}
