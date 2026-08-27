import type { Database } from "bun:sqlite";
import { WorkSession } from "../../domain/workSession/WorkSession";
import {
  CannotRescheduleNonSkippedWorkSessionError,
  WorkSessionStateNotFoundError,
} from "../../domain/workSession/WorkSessionError";
import {
  validateEndTime,
  validateStartBeforeEnd,
  validateSameDay,
  validateStartTimeNotInPast,
} from "../../domain/workSession/WorkSessionRules";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";
import type { WorkSessionMergeResult } from "./WorkSessionMergeService";

export class RescheduleWorkSessionUseCase {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) { }

  execute(params: { id: string; startTime: Date; endTime: Date }): WorkSessionMergeResult {
    return this.db.transaction(() => {
      const existing = this.repository.getById(params.id);
      if (!existing) {
        throw new Error(`WorkSession with id ${params.id} not found`);
      }

      const currentState = this.workSessionStateRepository.getById(existing.workSessionStateId);
      if (currentState?.state !== "SKIPPED") {
        throw new CannotRescheduleNonSkippedWorkSessionError(currentState?.state ?? "UNKNOWN");
      }

      const now = this.clock.now();
      validateStartTimeNotInPast(params.startTime, now);
      validateEndTime(params.endTime);
      validateStartBeforeEnd(params.startTime, params.endTime);
      validateSameDay(params.startTime, params.endTime);

      const inProgressState = this.workSessionStateRepository.findByState("INPROGRESS");
      if (!inProgressState) {
        throw new WorkSessionStateNotFoundError("INPROGRESS");
      }

      const updated = WorkSession.create({
        id: existing.id,
        workSessionStateId: inProgressState.id,
        startTime: params.startTime,
        endTime: params.endTime,
        completedAt: existing.completedAt,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        wrapUpAt: existing.wrapUpAt,
        rescheduleAt: now,
        waitConfirmAt: existing.waitConfirmAt,
        skippedAt: null,
        createdAt: existing.createdAt,
      });

      const result = this.repository.update(updated);
      this.notificationRepository.markAllReadForEntity("WORK_SESSION", existing.id);
      return { session: result, mergedFrom: [] };
    })();
  }
}
