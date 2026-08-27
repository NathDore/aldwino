import type { Database } from "bun:sqlite";
import { Notification, type NotificationType, type NotificationEntityType } from "../../../domain/notification/Notification";

export interface INotificationRepository {
  create(notification: Notification): Notification;
  getById(id: string): Notification | null;
  getAll(limit: number, offset: number): Notification[];
  countAll(): number;
  findUnreadByEntity(
    entityType: NotificationEntityType,
    entityId: string,
    type: NotificationType,
  ): Notification | null;
  markAsRead(id: string, now: Date): Notification | null;
  markAllReadForEntity(entityType: NotificationEntityType, entityId: string, now: Date): number;
  purgeDeletedBefore(cutoff: Date): number;
}

export class NotificationRepository implements INotificationRepository {
  constructor(private db: Database) {}

  create(notification: Notification): Notification {
    const json = notification.toJSON();
    const stmt = this.db.prepare(
      "INSERT INTO notifications (id, type, entityType, entityId, isRead, isDeleted, deletedAt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );
    stmt.run(
      json.id,
      json.type,
      json.entityType,
      json.entityId,
      json.isRead ? 1 : 0,
      json.isDeleted ? 1 : 0,
      json.deletedAt,
      json.createdAt,
    );
    return notification;
  }

  getById(id: string): Notification | null {
    const stmt = this.db.prepare("SELECT * FROM notifications WHERE id = ? AND isDeleted = 0");
    const row = stmt.get(id) as Record<string, string | number | null> | undefined;
    if (!row) {
      return null;
    }
    return this.rowToNotification(row);
  }

  getAll(limit: number, offset: number): Notification[] {
    const stmt = this.db.prepare(
      "SELECT * FROM notifications WHERE isDeleted = 0 ORDER BY createdAt DESC LIMIT ? OFFSET ?",
    );
    const rows = stmt.all(limit, offset) as Record<string, string | number | null>[];
    return rows.map((row) => this.rowToNotification(row));
  }

  countAll(): number {
    const stmt = this.db.prepare("SELECT COUNT(*) as count FROM notifications WHERE isDeleted = 0");
    const row = stmt.get() as { count: number };
    return row.count;
  }

  findUnreadByEntity(
    entityType: NotificationEntityType,
    entityId: string,
    type: NotificationType,
  ): Notification | null {
    const stmt = this.db.prepare(
      "SELECT * FROM notifications WHERE entityType = ? AND entityId = ? AND type = ? AND isRead = 0 AND isDeleted = 0",
    );
    const row = stmt.get(entityType, entityId, type) as Record<string, string | number | null> | undefined;
    if (!row) {
      return null;
    }
    return this.rowToNotification(row);
  }

  markAsRead(id: string, now: Date): Notification | null {
    const existing = this.getById(id);
    if (!existing) {
      return null;
    }
    const stmt = this.db.prepare(
      "UPDATE notifications SET isRead = 1, isDeleted = 1, deletedAt = ? WHERE id = ? AND isDeleted = 0",
    );
    stmt.run(now.toISOString(), id);
    return Notification.create({
      id: existing.id,
      type: existing.type,
      entityType: existing.entityType,
      entityId: existing.entityId,
      isRead: true,
      isDeleted: true,
      deletedAt: now,
      createdAt: existing.createdAt,
    });
  }

  markAllReadForEntity(entityType: NotificationEntityType, entityId: string, now: Date): number {
    const stmt = this.db.prepare(
      "UPDATE notifications SET isRead = 1, isDeleted = 1, deletedAt = ? WHERE entityType = ? AND entityId = ? AND isDeleted = 0",
    );
    const result = stmt.run(now.toISOString(), entityType, entityId);
    return result.changes;
  }

  purgeDeletedBefore(cutoff: Date): number {
    const stmt = this.db.prepare("DELETE FROM notifications WHERE isDeleted = 1 AND deletedAt <= ?");
    const result = stmt.run(cutoff.toISOString());
    return result.changes;
  }

  private rowToNotification(row: Record<string, string | number | null>): Notification {
    return Notification.create({
      id: row.id as string,
      type: row.type as NotificationType,
      entityType: row.entityType as NotificationEntityType,
      entityId: row.entityId as string,
      isRead: Boolean(row.isRead),
      isDeleted: Boolean(row.isDeleted),
      deletedAt: row.deletedAt ? new Date(row.deletedAt as string) : null,
      createdAt: new Date(row.createdAt as string),
    });
  }
}
