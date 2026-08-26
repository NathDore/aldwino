import {
  NotificationTypeInvalidError,
  NotificationEntityTypeInvalidError,
  NotificationEntityIdRequiredError,
} from "./NotificationError";
import type { NotificationType, NotificationEntityType } from "./Notification";

export const NOTIFICATION_TYPES: readonly NotificationType[] = [
  "WORK_SESSION_SKIPPED",
  "ASSIGNMENT_DUE_SOON",
  "ASSIGNMENT_OVERDUE",
];

export const NOTIFICATION_ENTITY_TYPES: readonly NotificationEntityType[] = ["ASSIGNMENT", "WORK_SESSION"];

export function validateType(type: NotificationType): void {
  if (!NOTIFICATION_TYPES.includes(type)) {
    throw new NotificationTypeInvalidError();
  }
}

export function validateEntityType(entityType: NotificationEntityType): void {
  if (!NOTIFICATION_ENTITY_TYPES.includes(entityType)) {
    throw new NotificationEntityTypeInvalidError();
  }
}

export function validateEntityId(entityId: string): void {
  if (!entityId || entityId.trim().length === 0) {
    throw new NotificationEntityIdRequiredError();
  }
}
