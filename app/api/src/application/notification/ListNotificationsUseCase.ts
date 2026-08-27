import type { Notification } from "../../domain/notification/Notification";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";

export interface ListNotificationsParams {
  limit: number;
  offset: number;
}

export interface ListNotificationsResult {
  items: Notification[];
  total: number;
  unreadCount: number;
}

export class ListNotificationsUseCase {
  constructor(private readonly repository: INotificationRepository) {}

  execute(params: ListNotificationsParams): ListNotificationsResult {
    const items = this.repository.getAll(params.limit, params.offset);
    const total = this.repository.countAll();
    const unreadCount = this.repository.countUnread();
    return { items, total, unreadCount };
  }
}
