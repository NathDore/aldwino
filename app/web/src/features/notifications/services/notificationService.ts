import { apiClient } from "@/shared/lib/apiClient";
import type { NotificationDto, NotificationsPage } from "../types/notification.types";

export async function fetchNotifications({ limit, offset }: { limit: number; offset: number }): Promise<NotificationsPage> {
  return apiClient<NotificationsPage>(`/notifications?limit=${limit}&offset=${offset}`);
}

export async function markNotificationRead(id: string): Promise<NotificationDto> {
  return apiClient<NotificationDto>(`/notifications/${id}/read`, { method: "POST" });
}

export async function fetchNotificationById(id: string): Promise<NotificationDto> {
  return apiClient<NotificationDto>(`/notifications/${id}`);
}
