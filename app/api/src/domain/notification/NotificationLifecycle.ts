import type { Notification, NotificationType } from "./Notification";
import { CannotRemoveNotificationError } from "./NotificationError";

export type NotificationLifecycleState = "UNREAD" | "READ_PENDING_ACTION" | "REMOVABLE" | "DELETED";

const ACTION_REQUIRED_TYPES: NotificationType[] = ["WORK_SESSION_SKIPPED", "ASSIGNMENT_OVERDUE"];

// Notification removability depends only on the notification's own state, not the current time.
export function resolveLifecycle(notification: Notification): NotificationLifecycleState {
  if (notification.isDeleted) {
    return "DELETED";
  }
  if (!notification.isRead) {
    return "UNREAD";
  }
  if (ACTION_REQUIRED_TYPES.includes(notification.type) && !notification.actionTaken) {
    return "READ_PENDING_ACTION";
  }
  return "REMOVABLE";
}

export function assertCanRemove(notification: Notification): void {
  const state = resolveLifecycle(notification);
  if (state !== "REMOVABLE") {
    throw new CannotRemoveNotificationError(state);
  }
}
