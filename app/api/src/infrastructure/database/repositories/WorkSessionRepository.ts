import type { Database } from "bun:sqlite";
import { WorkSession } from "../../../domain/workSession/WorkSession";

export interface IWorkSessionRepository {
  create(workSession: WorkSession): WorkSession;
  getById(id: string): WorkSession | null;
  getAll(): WorkSession[];
  update(workSession: WorkSession): WorkSession;
  findOverlappingInProgress(start: Date, end: Date, excludeId?: string): WorkSession[];
  purgeDeletedBefore(cutoff: Date): number;
}

export class WorkSessionRepository implements IWorkSessionRepository {
  constructor(private db: Database) {}

  create(workSession: WorkSession): WorkSession {
    const json = workSession.toJSON();
    const stmt = this.db.prepare(
      "INSERT INTO workSessions (id, workSessionStateId, startTime, endTime, completedAt, isDeleted, deletedAt, wrapUpAt, rescheduleAt, waitConfirmAt, skippedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    stmt.run(
      json.id,
      json.workSessionStateId,
      json.startTime,
      json.endTime,
      json.completedAt,
      json.isDeleted ? 1 : 0,
      json.deletedAt,
      json.wrapUpAt,
      json.rescheduleAt,
      json.waitConfirmAt,
      json.skippedAt,
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
      "UPDATE workSessions SET workSessionStateId = ?, startTime = ?, endTime = ?, completedAt = ?, isDeleted = ?, deletedAt = ?, wrapUpAt = ?, rescheduleAt = ?, waitConfirmAt = ?, skippedAt = ? WHERE id = ?",
    );
    stmt.run(
      json.workSessionStateId,
      json.startTime,
      json.endTime,
      json.completedAt,
      json.isDeleted ? 1 : 0,
      json.deletedAt,
      json.wrapUpAt,
      json.rescheduleAt,
      json.waitConfirmAt,
      json.skippedAt,
      json.id,
    );
    return workSession;
  }

  findOverlappingInProgress(start: Date, end: Date, excludeId?: string): WorkSession[] {
    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const params: (string | number)[] = [
      dayStart.toISOString(),
      dayEnd.toISOString(),
      end.toISOString(),
      start.toISOString(),
    ];
    let sql =
      "SELECT ws.* FROM workSessions ws " +
      "JOIN workSessionStates wss ON ws.workSessionStateId = wss.id " +
      "WHERE wss.state = 'INPROGRESS' AND ws.isDeleted = 0 " +
      "AND ws.startTime >= ? AND ws.startTime < ? " +
      "AND ws.startTime < ? AND ws.endTime > ?";
    if (excludeId) {
      sql += " AND ws.id != ?";
      params.push(excludeId);
    }

    const stmt = this.db.prepare(sql);
    const rows = stmt.all(...params) as Record<string, string | number | null>[];
    return rows.map((row) => this.rowToWorkSession(row));
  }

  purgeDeletedBefore(cutoff: Date): number {
    const stmt = this.db.prepare("DELETE FROM workSessions WHERE isDeleted = 1 AND deletedAt <= ?");
    const result = stmt.run(cutoff.toISOString());
    return result.changes;
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
      wrapUpAt: row.wrapUpAt ? new Date(row.wrapUpAt as string) : null,
      rescheduleAt: row.rescheduleAt ? new Date(row.rescheduleAt as string) : null,
      waitConfirmAt: row.waitConfirmAt ? new Date(row.waitConfirmAt as string) : null,
      skippedAt: row.skippedAt ? new Date(row.skippedAt as string) : null,
      createdAt: new Date(row.createdAt as string),
    });
  }
}
