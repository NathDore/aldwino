import type { Notification } from "../../domain/notification/Notification";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";

export class GetNotificationByIdUseCase {
  constructor(private readonly repository: INotificationRepository) {}

  execute(id: string): Notification | null {
    return this.repository.getById(id);
  }
}
