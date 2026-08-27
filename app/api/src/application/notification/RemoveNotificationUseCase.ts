import type { Notification } from "../../domain/notification/Notification";
import { NotificationNotFoundError } from "../../domain/notification/NotificationError";
import { assertCanRemove } from "../../domain/notification/NotificationLifecycle";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

export class RemoveNotificationUseCase {
  constructor(
    private readonly repository: INotificationRepository,
    private readonly clock: Clock,
  ) {}

  execute(id: string): Notification {
    const existing = this.repository.getById(id);
    if (!existing) {
      throw new NotificationNotFoundError(id);
    }
    assertCanRemove(existing);
    const removed = this.repository.softDeleteById(id, this.clock.now());
    if (!removed) {
      throw new NotificationNotFoundError(id);
    }
    return removed;
  }
}
