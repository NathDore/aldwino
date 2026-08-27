import type { NotificationDto } from "../types/notification.types";

const ACTION_REQUIRED_TYPES: NotificationDto["type"][] = ["WORK_SESSION_SKIPPED", "ASSIGNMENT_OVERDUE"];

export function isRemovable(notification: NotificationDto): boolean {
  if (!notification.isRead) return false;
  if (ACTION_REQUIRED_TYPES.includes(notification.type)) return notification.actionTaken;
  return true;
}
