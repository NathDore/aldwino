import type { Database } from "bun:sqlite";
import { AssignmentWorkSession, type AssignmentWorkSessionDetachReason } from "../../../domain/assignmentWorkSession/AssignmentWorkSession";

export interface IAssignmentWorkSessionRepository {
  create(link: AssignmentWorkSession): AssignmentWorkSession;
  getById(id: string): AssignmentWorkSession | null;
  getByIdIncludingDeleted(id: string): AssignmentWorkSession | null;
  getAll(): AssignmentWorkSession[];
  getByAssignmentId(assignmentId: string): AssignmentWorkSession[];
  getByWorkSessionId(workSessionId: string): AssignmentWorkSession[];
  getDetachedByAssignmentIdAndReason(
    assignmentId: string,
    reason: AssignmentWorkSessionDetachReason,
  ): AssignmentWorkSession[];
  getDetachedByWorkSessionIdAndReason(
    workSessionId: string,
    reason: AssignmentWorkSessionDetachReason,
  ): AssignmentWorkSession[];
  update(link: AssignmentWorkSession): AssignmentWorkSession;
  purgeDeletedBefore(cutoff: Date): number;
}

export class AssignmentWorkSessionRepository implements IAssignmentWorkSessionRepository {
  constructor(private db: Database) {}

  create(link: AssignmentWorkSession): AssignmentWorkSession {
    const json = link.toJSON();
    const stmt = this.db.prepare(
      "INSERT INTO assignmentWorkSessions (id, assignmentId, workSessionId, isDeleted, deletedAt, createdAt, workedOn, detachReason) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    stmt.run(
      json.id,
      json.assignmentId,
      json.workSessionId,
      json.isDeleted ? 1 : 0,
      json.deletedAt,
      json.createdAt,
      json.workedOn ? 1 : 0,
      json.detachReason,
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

  getByIdIncludingDeleted(id: string): AssignmentWorkSession | null {
    const stmt = this.db.prepare("SELECT * FROM assignmentWorkSessions WHERE id = ?");
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

  getDetachedByAssignmentIdAndReason(
    assignmentId: string,
    reason: AssignmentWorkSessionDetachReason,
  ): AssignmentWorkSession[] {
    const stmt = this.db.prepare(
      "SELECT * FROM assignmentWorkSessions WHERE assignmentId = ? AND isDeleted = 1 AND detachReason = ?",
    );
    const rows = stmt.all(assignmentId, reason) as Record<string, string | number | null>[];
    return rows.map((row) => this.rowToAssignmentWorkSession(row));
  }

  getDetachedByWorkSessionIdAndReason(
    workSessionId: string,
    reason: AssignmentWorkSessionDetachReason,
  ): AssignmentWorkSession[] {
    const stmt = this.db.prepare(
      "SELECT * FROM assignmentWorkSessions WHERE workSessionId = ? AND isDeleted = 1 AND detachReason = ?",
    );
    const rows = stmt.all(workSessionId, reason) as Record<string, string | number | null>[];
    return rows.map((row) => this.rowToAssignmentWorkSession(row));
  }

  update(link: AssignmentWorkSession): AssignmentWorkSession {
    const json = link.toJSON();
    const stmt = this.db.prepare(
      "UPDATE assignmentWorkSessions SET assignmentId = ?, workSessionId = ?, isDeleted = ?, deletedAt = ?, workedOn = ?, detachReason = ? WHERE id = ?",
    );
    stmt.run(
      json.assignmentId,
      json.workSessionId,
      json.isDeleted ? 1 : 0,
      json.deletedAt,
      json.workedOn ? 1 : 0,
      json.detachReason,
      json.id,
    );
    return link;
  }

  purgeDeletedBefore(cutoff: Date): number {
    const stmt = this.db.prepare(
      "DELETE FROM assignmentWorkSessions WHERE isDeleted = 1 AND detachReason = 'MANUAL' AND deletedAt <= ?",
    );
    const result = stmt.run(cutoff.toISOString());
    return result.changes;
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
      detachReason: (row.detachReason as AssignmentWorkSessionDetachReason | null) ?? null,
    });
  }
}
