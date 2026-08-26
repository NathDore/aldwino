import { validateType, validateEntityType, validateEntityId } from "./NotificationRules";

export type NotificationType = "WORK_SESSION_SKIPPED" | "ASSIGNMENT_DUE_SOON" | "ASSIGNMENT_OVERDUE";
export type NotificationEntityType = "ASSIGNMENT" | "WORK_SESSION";

export class Notification {
  private constructor(
    public readonly id: string,
    public readonly type: NotificationType,
    public readonly entityType: NotificationEntityType,
    public readonly entityId: string,
    public readonly isRead: boolean,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    type: NotificationType;
    entityType: NotificationEntityType;
    entityId: string;
    isRead?: boolean;
    isDeleted?: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
  }): Notification {
    validateType(params.type);
    validateEntityType(params.entityType);
    validateEntityId(params.entityId);
    return new Notification(
      params.id,
      params.type,
      params.entityType,
      params.entityId,
      params.isRead ?? false,
      params.isDeleted ?? false,
      params.deletedAt ?? null,
      params.createdAt,
    );
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      entityType: this.entityType,
      entityId: this.entityId,
      isRead: this.isRead,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt ? this.deletedAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
