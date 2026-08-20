import type { Database } from "bun:sqlite";
import { WorkSession } from "../../domain/workSession/WorkSession";
import { CannotRescheduleNonSkippedWorkSessionError } from "../../domain/workSession/WorkSessionError";
import {
  validateEndTime,
  validateStartBeforeEnd,
  validateSameDay,
  validateStartTimeNotInPast,
} from "../../domain/workSession/WorkSessionRules";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { Clock } from "../health/ports/Clock";
import type { WorkSessionMergeResult } from "./WorkSessionMergeService";

export class RescheduleWorkSessionUseCase {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
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

      const updated = WorkSession.create({
        id: existing.id,
        workSessionStateId: existing.workSessionStateId,
        startTime: params.startTime,
        endTime: params.endTime,
        completedAt: existing.completedAt,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        wrapUpAt: existing.wrapUpAt,
        rescheduleAt: now,
        createdAt: existing.createdAt,
      });

      return { session: this.repository.update(updated), mergedFrom: [] };
    })();
  }
}
