import type { Database } from "bun:sqlite";
import { WorkSessionState, type WorkSessionStateName } from "../../../domain/workSessionState/WorkSessionState";

export interface IWorkSessionStateRepository {
  getAll(): WorkSessionState[];
  getById(id: string): WorkSessionState | null;
  findByState(state: WorkSessionStateName): WorkSessionState | null;
}

export class WorkSessionStateRepository implements IWorkSessionStateRepository {
  constructor(private db: Database) {}

  getAll(): WorkSessionState[] {
    const stmt = this.db.prepare("SELECT * FROM workSessionStates");
    const rows = stmt.all() as Record<string, string>[];
    return rows.map((row) => this.rowToWorkSessionState(row));
  }

  getById(id: string): WorkSessionState | null {
    const stmt = this.db.prepare("SELECT * FROM workSessionStates WHERE id = ?");
    const row = stmt.get(id) as Record<string, string> | undefined;
    if (!row) {
      return null;
    }
    return this.rowToWorkSessionState(row);
  }

  findByState(state: WorkSessionStateName): WorkSessionState | null {
    const stmt = this.db.prepare("SELECT * FROM workSessionStates WHERE state = ?");
    const row = stmt.get(state) as Record<string, string> | undefined;
    if (!row) {
      return null;
    }
    return this.rowToWorkSessionState(row);
  }

  private rowToWorkSessionState(row: Record<string, string>): WorkSessionState {
    return WorkSessionState.create({
      id: row.id,
      state: row.state as WorkSessionStateName,
    });
  }
}
