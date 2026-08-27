import type { Notification } from "../../domain/notification/Notification";
import { NotificationNotFoundError } from "../../domain/notification/NotificationError";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

export class MarkNotificationReadUseCase {
  constructor(
    private readonly repository: INotificationRepository,
    private readonly clock: Clock,
  ) {}

  execute(id: string): Notification {
    const updated = this.repository.markAsRead(id, this.clock.now());
    if (!updated) {
      throw new NotificationNotFoundError(id);
    }
    return updated;
  }
}
