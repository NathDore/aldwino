import type { Database } from "bun:sqlite";
import { WorkSession } from "../../domain/workSession/WorkSession";
import {
  validateStartTime,
  validateEndTime,
  validateStartBeforeEnd,
  validateSameDay,
} from "../../domain/workSession/WorkSessionRules";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { WorkSessionMergeService, WorkSessionMergeResult } from "./WorkSessionMergeService";

export class RescheduleWorkSessionUseCase {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
    private readonly mergeService: WorkSessionMergeService,
    private readonly db: Database,
  ) {}

  execute(params: { id: string; startTime: Date; endTime: Date }): WorkSessionMergeResult {
    return this.db.transaction(() => {
      const existing = this.repository.getById(params.id);
      if (!existing) {
        throw new Error(`WorkSession with id ${params.id} not found`);
      }

      validateStartTime(params.startTime);
      validateEndTime(params.endTime);
      validateStartBeforeEnd(params.startTime, params.endTime);
      validateSameDay(params.startTime, params.endTime);

      const currentState = this.workSessionStateRepository.getById(existing.workSessionStateId);
      if (currentState?.state === "INPROGRESS") {
        const merged = this.mergeService.checkAndMerge({
          startTime: params.startTime,
          endTime: params.endTime,
          self: existing,
        });
        if (merged) {
          return merged;
        }
      }

      const updated = WorkSession.create({
        id: existing.id,
        workSessionStateId: existing.workSessionStateId,
        startTime: params.startTime,
        endTime: params.endTime,
        completedAt: existing.completedAt,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        createdAt: existing.createdAt,
      });

      return { session: this.repository.update(updated), mergedFrom: [] };
    })();
  }
}
