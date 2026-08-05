import type { Database } from "bun:sqlite";
import { ASSIGNMENT_STATES } from "../../../domain/assignmentState/AssignmentStateRules";

export function seedAssignmentStates(db: Database): void {
  const existing = db.prepare("SELECT state FROM assignmentStates").all() as { state: string }[];
  const existingStates = new Set(existing.map((row) => row.state));
  const insert = db.prepare("INSERT INTO assignmentStates (id, state) VALUES (?, ?)");
  for (const state of ASSIGNMENT_STATES) {
    if (!existingStates.has(state)) {
      insert.run(crypto.randomUUID(), state);
    }
  }
}
