import type { Database } from "bun:sqlite";
import { WorkSession } from "../../../domain/workSession/WorkSession";

export interface IWorkSessionRepository {
  create(workSession: WorkSession): WorkSession;
  getById(id: string): WorkSession | null;
  getAll(): WorkSession[];
  update(workSession: WorkSession): WorkSession;
}

export class WorkSessionRepository implements IWorkSessionRepository {
  constructor(private db: Database) {}

  create(workSession: WorkSession): WorkSession {
    const json = workSession.toJSON();
    const stmt = this.db.prepare(
      "INSERT INTO workSessions (id, workSessionStateId, startTime, endTime, completedAt, isDeleted, deletedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    stmt.run(
      json.id,
      json.workSessionStateId,
      json.startTime,
      json.endTime,
      json.completedAt,
      json.isDeleted ? 1 : 0,
      json.deletedAt,
      json.createdAt,
    );
    return workSession;
  }

  getById(id: string): WorkSession | null {
    const stmt = this.db.prepare("SELECT * FROM workSessions WHERE id = ? AND isDeleted = 0");
    const row = stmt.get(id) as Record<string, string | number | null> | undefined;
    if (!row) {
      return null;
    }
    return this.rowToWorkSession(row);
  }

  getAll(): WorkSession[] {
    const stmt = this.db.prepare("SELECT * FROM workSessions WHERE isDeleted = 0");
    const rows = stmt.all() as Record<string, string | number | null>[];
    return rows.map((row) => this.rowToWorkSession(row));
  }

  update(workSession: WorkSession): WorkSession {
    const json = workSession.toJSON();
    const stmt = this.db.prepare(
      "UPDATE workSessions SET workSessionStateId = ?, startTime = ?, endTime = ?, completedAt = ?, isDeleted = ?, deletedAt = ? WHERE id = ?",
    );
    stmt.run(
      json.workSessionStateId,
      json.startTime,
      json.endTime,
      json.completedAt,
      json.isDeleted ? 1 : 0,
      json.deletedAt,
      json.id,
    );
    return workSession;
  }

  private rowToWorkSession(row: Record<string, string | number | null>): WorkSession {
    return WorkSession.create({
      id: row.id as string,
      workSessionStateId: row.workSessionStateId as string,
      startTime: new Date(row.startTime as string),
      endTime: new Date(row.endTime as string),
      completedAt: row.completedAt ? new Date(row.completedAt as string) : null,
      isDeleted: Boolean(row.isDeleted),
      deletedAt: row.deletedAt ? new Date(row.deletedAt as string) : null,
      createdAt: new Date(row.createdAt as string),
    });
  }
}
