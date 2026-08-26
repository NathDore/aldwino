import type { Notification } from "../../domain/notification/Notification";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";

export class ListNotificationsUseCase {
  constructor(private readonly repository: INotificationRepository) {}

  execute(): Notification[] {
    return this.repository.getAll();
  }
}
