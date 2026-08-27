export type NotificationType = "WORK_SESSION_SKIPPED" | "ASSIGNMENT_DUE_SOON" | "ASSIGNMENT_OVERDUE";
export type NotificationEntityType = "ASSIGNMENT" | "WORK_SESSION";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
  isRead: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
}

export interface NotificationsPage {
  items: NotificationDto[];
  total: number;
}
