import type { Database } from "bun:sqlite";
import { AssignmentWorkSession } from "../../../domain/assignmentWorkSession/AssignmentWorkSession";

export interface IAssignmentWorkSessionRepository {
  create(link: AssignmentWorkSession): AssignmentWorkSession;
  getById(id: string): AssignmentWorkSession | null;
  getAll(): AssignmentWorkSession[];
  getByAssignmentId(assignmentId: string): AssignmentWorkSession[];
  getByWorkSessionId(workSessionId: string): AssignmentWorkSession[];
  update(link: AssignmentWorkSession): AssignmentWorkSession;
}

export class AssignmentWorkSessionRepository implements IAssignmentWorkSessionRepository {
  constructor(private db: Database) {}

  create(link: AssignmentWorkSession): AssignmentWorkSession {
    const json = link.toJSON();
    const stmt = this.db.prepare(
      "INSERT INTO assignmentWorkSessions (id, assignmentId, workSessionId, isDeleted, deletedAt, createdAt, workedOn) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    stmt.run(
      json.id,
      json.assignmentId,
      json.workSessionId,
      json.isDeleted ? 1 : 0,
      json.deletedAt,
      json.createdAt,
      json.workedOn ? 1 : 0,
    );
    return link;
  }

  getById(id: string): AssignmentWorkSession | null {
    const stmt = this.db.prepare("SELECT * FROM assignmentWorkSessions WHERE id = ? AND isDeleted = 0");
    const row = stmt.get(id) as Record<string, string | number | null> | undefined;
    if (!row) {
      return null;
    }
    return this.rowToAssignmentWorkSession(row);
  }

  getAll(): AssignmentWorkSession[] {
    const stmt = this.db.prepare("SELECT * FROM assignmentWorkSessions WHERE isDeleted = 0");
    const rows = stmt.all() as Record<string, string | number | null>[];
    return rows.map((row) => this.rowToAssignmentWorkSession(row));
  }

  getByAssignmentId(assignmentId: string): AssignmentWorkSession[] {
    const stmt = this.db.prepare("SELECT * FROM assignmentWorkSessions WHERE assignmentId = ? AND isDeleted = 0");
    const rows = stmt.all(assignmentId) as Record<string, string | number | null>[];
    return rows.map((row) => this.rowToAssignmentWorkSession(row));
  }

  getByWorkSessionId(workSessionId: string): AssignmentWorkSession[] {
    const stmt = this.db.prepare("SELECT * FROM assignmentWorkSessions WHERE workSessionId = ? AND isDeleted = 0");
    const rows = stmt.all(workSessionId) as Record<string, string | number | null>[];
    return rows.map((row) => this.rowToAssignmentWorkSession(row));
  }

  update(link: AssignmentWorkSession): AssignmentWorkSession {
    const json = link.toJSON();
    const stmt = this.db.prepare(
      "UPDATE assignmentWorkSessions SET assignmentId = ?, workSessionId = ?, isDeleted = ?, deletedAt = ?, workedOn = ? WHERE id = ?",
    );
    stmt.run(json.assignmentId, json.workSessionId, json.isDeleted ? 1 : 0, json.deletedAt, json.workedOn ? 1 : 0, json.id);
    return link;
  }

  private rowToAssignmentWorkSession(row: Record<string, string | number | null>): AssignmentWorkSession {
    return AssignmentWorkSession.create({
      id: row.id as string,
      assignmentId: row.assignmentId as string,
      workSessionId: row.workSessionId as string,
      isDeleted: Boolean(row.isDeleted),
      deletedAt: row.deletedAt ? new Date(row.deletedAt as string) : null,
      createdAt: new Date(row.createdAt as string),
      workedOn: Boolean(row.workedOn),
    });
  }
}
