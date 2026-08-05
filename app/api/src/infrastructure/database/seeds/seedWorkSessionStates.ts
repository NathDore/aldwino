import type { Database } from "bun:sqlite";
import { WORK_SESSION_STATES } from "../../../domain/workSessionState/WorkSessionStateRules";

export function seedWorkSessionStates(db: Database): void {
  const existing = db.prepare("SELECT state FROM workSessionStates").all() as { state: string }[];
  const existingStates = new Set(existing.map((row) => row.state));
  const insert = db.prepare("INSERT INTO workSessionStates (id, state) VALUES (?, ?)");
  for (const state of WORK_SESSION_STATES) {
    if (!existingStates.has(state)) {
      insert.run(crypto.randomUUID(), state);
    }
  }
}
