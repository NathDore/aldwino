import type { Database } from "bun:sqlite";
import { Assignment } from "../../../domain/assignment/Assignment";

export interface IAssignmentRepository {
  create(assignment: Assignment): Assignment;
  getById(id: string): Assignment | null;
  getAll(): Assignment[];
  getByEventId(eventId: string): Assignment[];
  update(assignment: Assignment): Assignment;
  delete(id: string): boolean;
}

export class AssignmentRepository implements IAssignmentRepository {
  constructor(private db: Database) {}

  create(assignment: Assignment): Assignment {
    const json = assignment.toJSON();
    const stmt = this.db.prepare(
      "INSERT INTO assignments (id, courseId, eventId, description, dueDate, startTime, expectedDurationMinutes, isCompleted, completedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
      json.createdAt,
    );
    return assignment;
  }

  getById(id: string): Assignment | null {
    const stmt = this.db.prepare("SELECT * FROM assignments WHERE id = ?");
    const row = stmt.get(id) as Record<string, string | number | null> | undefined;
    if (!row) {
      return null;
    }
    return this.rowToAssignment(row);
  }

  getAll(): Assignment[] {
    const stmt = this.db.prepare("SELECT * FROM assignments");
    const rows = stmt.all() as Record<string, string | number | null>[];
    return rows.map((row) => this.rowToAssignment(row));
  }

  getByEventId(eventId: string): Assignment[] {
    const stmt = this.db.prepare("SELECT * FROM assignments WHERE eventId = ?");
    const rows = stmt.all(eventId) as Record<string, string | number | null>[];
    return rows.map((row) => this.rowToAssignment(row));
  }

  update(assignment: Assignment): Assignment {
    const json = assignment.toJSON();
    const stmt = this.db.prepare(
      "UPDATE assignments SET courseId = ?, eventId = ?, description = ?, dueDate = ?, startTime = ?, expectedDurationMinutes = ?, isCompleted = ?, completedAt = ? WHERE id = ?",
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
      json.id,
    );
    return assignment;
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare("DELETE FROM assignments WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
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
      createdAt: new Date(row.createdAt as string),
    });
  }
}
