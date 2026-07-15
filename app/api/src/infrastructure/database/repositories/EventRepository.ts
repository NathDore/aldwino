import type { Database } from "bun:sqlite";
import { Event } from "../../../domain/event/Event";

export interface IEventRepository {
  create(event: Event): Event;
  getById(id: string): Event | null;
  getAll(): Event[];
  update(event: Event): Event;
  delete(id: string): boolean;
}

export class EventRepository implements IEventRepository {
  constructor(private db: Database) {}

  create(event: Event): Event {
    const json = event.toJSON();
    const stmt = this.db.prepare(
      "INSERT INTO events (id, startDateTime, endDateTime, createdAt) VALUES (?, ?, ?, ?)",
    );
    stmt.run(json.id, json.startTime, json.endTime, json.createdAt);
    return event;
  }

  getById(id: string): Event | null {
    const stmt = this.db.prepare("SELECT * FROM events WHERE id = ?");
    const row = stmt.get(id) as Record<string, string> | undefined;
    if (!row) {
      return null;
    }
    return this.rowToEvent(row);
  }

  getAll(): Event[] {
    const stmt = this.db.prepare("SELECT * FROM events");
    const rows = stmt.all() as Record<string, string>[];
    return rows.map((row) => this.rowToEvent(row));
  }

  update(event: Event): Event {
    const json = event.toJSON();
    const stmt = this.db.prepare(
      "UPDATE events SET startDateTime = ?, endDateTime = ? WHERE id = ?",
    );
    stmt.run(json.startTime, json.endTime, json.id);
    return event;
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare("DELETE FROM events WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  private rowToEvent(row: Record<string, string>): Event {
    return Event.create({
      id: row.id,
      startTime: new Date(row.startDateTime),
      endTime: new Date(row.endDateTime),
      createdAt: new Date(row.createdAt),
    });
  }
}
