import type { Database } from "bun:sqlite";
import { AssignmentState, type AssignmentStateName } from "../../../domain/assignmentState/AssignmentState";

export interface IAssignmentStateRepository {
  getAll(): AssignmentState[];
  getById(id: string): AssignmentState | null;
  findByState(state: AssignmentStateName): AssignmentState | null;
}

export class AssignmentStateRepository implements IAssignmentStateRepository {
  constructor(private db: Database) {}

  getAll(): AssignmentState[] {
    const stmt = this.db.prepare("SELECT * FROM assignmentStates");
    const rows = stmt.all() as Record<string, string>[];
    return rows.map((row) => this.rowToAssignmentState(row));
  }

  getById(id: string): AssignmentState | null {
    const stmt = this.db.prepare("SELECT * FROM assignmentStates WHERE id = ?");
    const row = stmt.get(id) as Record<string, string> | undefined;
    if (!row) {
      return null;
    }
    return this.rowToAssignmentState(row);
  }

  findByState(state: AssignmentStateName): AssignmentState | null {
    const stmt = this.db.prepare("SELECT * FROM assignmentStates WHERE state = ?");
    const row = stmt.get(state) as Record<string, string> | undefined;
    if (!row) {
      return null;
    }
    return this.rowToAssignmentState(row);
  }

  private rowToAssignmentState(row: Record<string, string>): AssignmentState {
    return AssignmentState.create({
      id: row.id,
      state: row.state as AssignmentStateName,
    });
  }
}
