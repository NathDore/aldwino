import type { Database } from "bun:sqlite";
import { Course } from "../../../domain/course/Course";

export interface ICourseRepository {
  create(course: Course): Course;
  getById(id: string): Course | null;
  getAll(): Course[];
  update(course: Course): Course;
  delete(id: string): boolean;
  existsByCode(code: string, excludeId?: string): boolean;
}

export class CourseRepository implements ICourseRepository {
  constructor(private db: Database) {}

  create(course: Course): Course {
    const json = course.toJSON();
    const stmt = this.db.prepare(
      "INSERT INTO courses (id, color, code, title, createdAt) VALUES (?, ?, ?, ?, ?)",
    );
    stmt.run(json.id, json.color, json.code, json.title, json.createdAt);
    return course;
  }

  getById(id: string): Course | null {
    const stmt = this.db.prepare("SELECT * FROM courses WHERE id = ?");
    const row = stmt.get(id) as Record<string, string> | undefined;
    if (!row) {
      return null;
    }
    return this.rowToCourse(row);
  }

  getAll(): Course[] {
    const stmt = this.db.prepare("SELECT * FROM courses");
    const rows = stmt.all() as Record<string, string>[];
    return rows.map((row) => this.rowToCourse(row));
  }

  update(course: Course): Course {
    const json = course.toJSON();
    const stmt = this.db.prepare(
      "UPDATE courses SET color = ?, code = ?, title = ? WHERE id = ?",
    );
    stmt.run(json.color, json.code, json.title, json.id);
    return course;
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare("DELETE FROM courses WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  existsByCode(code: string, excludeId?: string): boolean {
    const stmt = excludeId
      ? this.db.prepare("SELECT 1 FROM courses WHERE code = ? AND id != ?")
      : this.db.prepare("SELECT 1 FROM courses WHERE code = ?");
    const row = excludeId ? stmt.get(code, excludeId) : stmt.get(code);
    return row !== undefined && row !== null;
  }

  private rowToCourse(row: Record<string, string>): Course {
    return Course.create({
      id: row.id,
      color: row.color,
      code: row.code,
      title: row.title,
      createdAt: new Date(row.createdAt),
    });
  }
}
