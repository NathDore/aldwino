import type { Notification } from "../../domain/notification/Notification";
import { NotificationNotFoundError } from "../../domain/notification/NotificationError";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";

export class MarkNotificationReadUseCase {
  constructor(private readonly repository: INotificationRepository) {}

  execute(id: string): Notification {
    const updated = this.repository.markAsRead(id);
    if (!updated) {
      throw new NotificationNotFoundError(id);
    }
    return updated;
  }
}
