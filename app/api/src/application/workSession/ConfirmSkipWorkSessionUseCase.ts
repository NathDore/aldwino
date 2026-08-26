import type { Database } from "bun:sqlite";
import { WorkSession } from "../../domain/workSession/WorkSession";
import {
  CannotConfirmSkipNonWaitConfirmWorkSessionError,
  WorkSessionStateNotFoundError,
} from "../../domain/workSession/WorkSessionError";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

export class ConfirmSkipWorkSessionUseCase {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(id: string): WorkSession {
    return this.db.transaction(() => {
      const existing = this.repository.getById(id);
      if (!existing) {
        throw new Error(`WorkSession with id ${id} not found`);
      }

      const currentState = this.workSessionStateRepository.getById(existing.workSessionStateId);
      if (currentState?.state !== "WAIT_CONFIRM") {
        throw new CannotConfirmSkipNonWaitConfirmWorkSessionError(currentState?.state ?? "UNKNOWN");
      }

      const skippedState = this.workSessionStateRepository.findByState("SKIPPED");
      if (!skippedState) {
        throw new WorkSessionStateNotFoundError("SKIPPED");
      }

      const now = this.clock.now();
      const updated = WorkSession.create({
        id: existing.id,
        workSessionStateId: skippedState.id,
        startTime: existing.startTime,
        endTime: existing.endTime,
        completedAt: existing.completedAt,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        wrapUpAt: existing.wrapUpAt,
        rescheduleAt: existing.rescheduleAt,
        waitConfirmAt: null,
        skippedAt: now,
        createdAt: existing.createdAt,
      });

      const result = this.repository.update(updated);
      this.notificationRepository.markAllReadForEntity("WORK_SESSION", existing.id, now);
      return result;
    })();
  }
}
