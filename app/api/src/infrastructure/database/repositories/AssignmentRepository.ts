import type { Database } from "bun:sqlite";
import { Assignment } from "../../../domain/assignment/Assignment";

export interface IAssignmentRepository {
  create(assignment: Assignment): Assignment;
  getById(id: string): Assignment | null;
  getAll(): Assignment[];
  getByEventId(eventId: string): Assignment[];
  update(assignment: Assignment): Assignment;
  purgeDeletedBefore(cutoff: Date): number;
}

export class AssignmentRepository implements IAssignmentRepository {
  constructor(private db: Database) {}

  create(assignment: Assignment): Assignment {
    const json = assignment.toJSON();
    const stmt = this.db.prepare(
      "INSERT INTO assignments (id, courseId, eventId, description, dueDate, startTime, expectedDurationMinutes, isCompleted, completedAt, isDeleted, deletedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    );
    stmt.run(
      json.id,
      json.courseId,
      json.eventId,
      json.description,
      json.dueDate,
      json.startTime,
      json.expectedDurationMinutes,
      json.isCompleted ? 1 : 0,
      json.completedAt,
      json.isDeleted ? 1 : 0,
      json.deletedAt,
      json.createdAt,
    );
    return assignment;
  }

  getById(id: string): Assignment | null {
    const stmt = this.db.prepare("SELECT * FROM assignments WHERE id = ? AND isDeleted = 0");
    const row = stmt.get(id) as Record<string, string | number | null> | undefined;
    if (!row) {
      return null;
    }
    return this.rowToAssignment(row);
  }

  getAll(): Assignment[] {
    const stmt = this.db.prepare("SELECT * FROM assignments WHERE isDeleted = 0");
    const rows = stmt.all() as Record<string, string | number | null>[];
    return rows.map((row) => this.rowToAssignment(row));
  }

  getByEventId(eventId: string): Assignment[] {
    const stmt = this.db.prepare("SELECT * FROM assignments WHERE eventId = ? AND isDeleted = 0");
    const rows = stmt.all(eventId) as Record<string, string | number | null>[];
    return rows.map((row) => this.rowToAssignment(row));
  }

  update(assignment: Assignment): Assignment {
    const json = assignment.toJSON();
    const stmt = this.db.prepare(
      "UPDATE assignments SET courseId = ?, eventId = ?, description = ?, dueDate = ?, startTime = ?, expectedDurationMinutes = ?, isCompleted = ?, completedAt = ?, isDeleted = ?, deletedAt = ? WHERE id = ?",
    );
    stmt.run(
      json.courseId,
      json.eventId,
      json.description,
      json.dueDate,
      json.startTime,
      json.expectedDurationMinutes,
      json.isCompleted ? 1 : 0,
      json.completedAt,
      json.isDeleted ? 1 : 0,
      json.deletedAt,
      json.id,
    );
    return assignment;
  }

  purgeDeletedBefore(cutoff: Date): number {
    const stmt = this.db.prepare("DELETE FROM assignments WHERE isDeleted = 1 AND deletedAt <= ?");
    const result = stmt.run(cutoff.toISOString());
    return result.changes;
  }

  private rowToAssignment(row: Record<string, string | number | null>): Assignment {
    return Assignment.create({
      id: row.id as string,
      courseId: row.courseId as string,
      eventId: row.eventId as string,
      description: row.description as string,
      dueDate: new Date(row.dueDate as string),
      startTime: new Date(row.startTime as string),
      expectedDurationMinutes: row.expectedDurationMinutes as number,
      isCompleted: Boolean(row.isCompleted),
      completedAt: row.completedAt ? new Date(row.completedAt as string) : null,
      isDeleted: Boolean(row.isDeleted),
      deletedAt: row.deletedAt ? new Date(row.deletedAt as string) : null,
      createdAt: new Date(row.createdAt as string),
    });
  }
}
