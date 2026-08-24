import type { Database } from "bun:sqlite";
import { Course } from "../../../domain/course/Course";

export interface ICourseRepository {
  create(course: Course): Course;
  getById(id: string): Course | null;
  getAll(): Course[];
  update(course: Course): Course;
  existsByCode(code: string, excludeId?: string): boolean;
  purgeDeletedBefore(cutoff: Date): number;
}

export class CourseRepository implements ICourseRepository {
  constructor(private db: Database) {}

  create(course: Course): Course {
    const json = course.toJSON();
    const stmt = this.db.prepare(
      "INSERT INTO courses (id, color, code, title, isDeleted, deletedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
    );
    stmt.run(json.id, json.color, json.code, json.title, json.isDeleted ? 1 : 0, json.deletedAt, json.createdAt);
    return course;
  }

  getById(id: string): Course | null {
    const stmt = this.db.prepare("SELECT * FROM courses WHERE id = ? AND isDeleted = 0");
    const row = stmt.get(id) as Record<string, string | number | null> | undefined;
    if (!row) {
      return null;
    }
    return this.rowToCourse(row);
  }

  getAll(): Course[] {
    const stmt = this.db.prepare("SELECT * FROM courses WHERE isDeleted = 0");
    const rows = stmt.all() as Record<string, string | number | null>[];
    return rows.map((row) => this.rowToCourse(row));
  }

  update(course: Course): Course {
    const json = course.toJSON();
    const stmt = this.db.prepare(
      "UPDATE courses SET color = ?, code = ?, title = ?, isDeleted = ?, deletedAt = ? WHERE id = ?",
    );
    stmt.run(json.color, json.code, json.title, json.isDeleted ? 1 : 0, json.deletedAt, json.id);
    return course;
  }

  existsByCode(code: string, excludeId?: string): boolean {
    const stmt = excludeId
      ? this.db.prepare("SELECT 1 FROM courses WHERE code = ? AND id != ? AND isDeleted = 0")
      : this.db.prepare("SELECT 1 FROM courses WHERE code = ? AND isDeleted = 0");
    const row = excludeId ? stmt.get(code, excludeId) : stmt.get(code);
    return row !== undefined && row !== null;
  }

  purgeDeletedBefore(cutoff: Date): number {
    const stmt = this.db.prepare("DELETE FROM courses WHERE isDeleted = 1 AND deletedAt <= ?");
    const result = stmt.run(cutoff.toISOString());
    return result.changes;
  }

  private rowToCourse(row: Record<string, string | number | null>): Course {
    return Course.create({
      id: row.id as string,
      color: row.color as string,
      code: row.code as string,
      title: row.title as string,
      isDeleted: Boolean(row.isDeleted),
      deletedAt: row.deletedAt ? new Date(row.deletedAt as string) : null,
      createdAt: new Date(row.createdAt as string),
    });
  }
}
