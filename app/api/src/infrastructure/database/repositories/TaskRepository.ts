import type { Database } from "bun:sqlite";
import { Task } from "../../../domain/task/Task";

export interface ITaskRepository {
  create(task: Task): Task;
  getById(id: string): Task | null;
  getAll(): Task[];
  update(task: Task): Task;
  delete(id: string): boolean;
}

export class TaskRepository implements ITaskRepository {
  constructor(private db: Database) {}

  create(task: Task): Task {
    const json = task.toJSON();
    const stmt = this.db.prepare(
      "INSERT INTO tasks (id, assignmentId, description, isCompleted, createdAt) VALUES (?, ?, ?, ?, ?)",
    );
    stmt.run(json.id, json.assignmentId, json.description, json.isCompleted ? 1 : 0, json.createdAt);
    return task;
  }

  getById(id: string): Task | null {
    const stmt = this.db.prepare("SELECT * FROM tasks WHERE id = ?");
    const row = stmt.get(id) as Record<string, string | number | null> | undefined;
    if (!row) {
      return null;
    }
    return this.rowToTask(row);
  }

  getAll(): Task[] {
    const stmt = this.db.prepare("SELECT * FROM tasks");
    const rows = stmt.all() as Record<string, string | number | null>[];
    return rows.map((row) => this.rowToTask(row));
  }

  update(task: Task): Task {
    const json = task.toJSON();
    const stmt = this.db.prepare(
      "UPDATE tasks SET assignmentId = ?, description = ?, isCompleted = ? WHERE id = ?",
    );
    stmt.run(json.assignmentId, json.description, json.isCompleted ? 1 : 0, json.id);
    return task;
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare("DELETE FROM tasks WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private rowToTask(row: Record<string, string | number | null>): Task {
    return Task.create({
      id: row.id as string,
      assignmentId: row.assignmentId as string,
      description: row.description as string,
      isCompleted: Boolean(row.isCompleted),
      createdAt: new Date(row.createdAt as string),
    });
  }
}
