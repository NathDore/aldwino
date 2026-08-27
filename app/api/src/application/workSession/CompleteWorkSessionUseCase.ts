import type { Database } from "bun:sqlite";
import { WorkSession } from "../../domain/workSession/WorkSession";
import {
  CannotCompleteNonInProgressWorkSessionError,
  WorkSessionStateNotFoundError,
} from "../../domain/workSession/WorkSessionError";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { Clock } from "../health/ports/Clock";

export class CompleteWorkSessionUseCase {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
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
      if (currentState?.state !== "INPROGRESS") {
        throw new CannotCompleteNonInProgressWorkSessionError(currentState?.state ?? "UNKNOWN");
      }

      const completedState = this.workSessionStateRepository.findByState("COMPLETED");
      if (!completedState) {
        throw new WorkSessionStateNotFoundError("COMPLETED");
      }

      const updated = WorkSession.create({
        id: existing.id,
        workSessionStateId: completedState.id,
        startTime: existing.startTime,
        endTime: existing.endTime,
        completedAt: this.clock.now(),
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        wrapUpAt: existing.wrapUpAt,
        rescheduleAt: existing.rescheduleAt,
        waitConfirmAt: existing.waitConfirmAt,
        skippedAt: existing.skippedAt,
        createdAt: existing.createdAt,
      });

      return this.repository.update(updated);
    })();
  }
}
