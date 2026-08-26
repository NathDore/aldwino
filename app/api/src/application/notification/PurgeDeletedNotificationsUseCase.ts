import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export class PurgeDeletedNotificationsUseCase {
  constructor(
    private readonly repository: INotificationRepository,
    private readonly clock: Clock,
  ) {}

  execute(): number {
    const cutoff = new Date(this.clock.now().getTime() - RETENTION_MS);
    return this.repository.purgeDeletedBefore(cutoff);
  }
}
