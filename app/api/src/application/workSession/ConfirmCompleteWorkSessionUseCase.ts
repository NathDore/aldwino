import type { Database } from "bun:sqlite";
import { WorkSession } from "../../domain/workSession/WorkSession";
import {
  CannotConfirmCompleteNonWaitConfirmWorkSessionError,
  WorkSessionStateNotFoundError,
} from "../../domain/workSession/WorkSessionError";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

export class ConfirmCompleteWorkSessionUseCase {
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
        throw new CannotConfirmCompleteNonWaitConfirmWorkSessionError(currentState?.state ?? "UNKNOWN");
      }

      const completedState = this.workSessionStateRepository.findByState("COMPLETED");
      if (!completedState) {
        throw new WorkSessionStateNotFoundError("COMPLETED");
      }

      const now = this.clock.now();
      const updated = WorkSession.create({
        id: existing.id,
        workSessionStateId: completedState.id,
        startTime: existing.startTime,
        endTime: existing.endTime,
        completedAt: now,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        wrapUpAt: existing.wrapUpAt,
        rescheduleAt: existing.rescheduleAt,
        waitConfirmAt: null,
        skippedAt: existing.skippedAt,
        createdAt: existing.createdAt,
      });

      const result = this.repository.update(updated);
      this.notificationRepository.markAllReadForEntity("WORK_SESSION", existing.id, now);
      return result;
    })();
  }
}
