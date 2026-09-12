import { Database } from "bun:sqlite";
import { mkdirSync } from "fs";
import { homedir } from "os";
import path from "path";

let db: Database | null = null;

function resolveAppDataDir(): string {
  switch (process.platform) {
    case "win32":
      return path.join(process.env.APPDATA ?? path.join(homedir(), "AppData", "Roaming"), "aldwino");
    case "darwin":
      return path.join(homedir(), "Library", "Application Support", "aldwino");
    default:
      return path.join(process.env.XDG_DATA_HOME ?? path.join(homedir(), ".local", "share"), "aldwino");
  }
}

export function getDatabase(): Database {
  if (db === null) {
    const appDataDir = resolveAppDataDir();
    mkdirSync(appDataDir, { recursive: true });
    const dbPath = path.join(appDataDir, "aldwino.db");
    db = new Database(dbPath);
  }
  return db;
}
