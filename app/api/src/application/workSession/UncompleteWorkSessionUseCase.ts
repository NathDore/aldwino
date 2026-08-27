import type { Database } from "bun:sqlite";
import { WorkSession } from "../../domain/workSession/WorkSession";
import {
  CannotUncompleteNonCompletedWorkSessionError,
  CannotUncompletePastWorkSessionError,
  WorkSessionStateNotFoundError,
} from "../../domain/workSession/WorkSessionError";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { Clock } from "../health/ports/Clock";
import type { WorkSessionMergeService, WorkSessionMergeResult } from "./WorkSessionMergeService";

export class UncompleteWorkSessionUseCase {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
    private readonly mergeService: WorkSessionMergeService,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(id: string): WorkSessionMergeResult {
    return this.db.transaction(() => {
      const existing = this.repository.getById(id);
      if (!existing) {
        throw new Error(`WorkSession with id ${id} not found`);
      }

      const currentState = this.workSessionStateRepository.getById(existing.workSessionStateId);
      if (currentState?.state !== "COMPLETED") {
        throw new CannotUncompleteNonCompletedWorkSessionError(currentState?.state ?? "UNKNOWN");
      }

      if (existing.endTime < this.clock.now()) {
        throw new CannotUncompletePastWorkSessionError();
      }

      const inProgressState = this.workSessionStateRepository.findByState("INPROGRESS");
      if (!inProgressState) {
        throw new WorkSessionStateNotFoundError("INPROGRESS");
      }

      const merged = this.mergeService.checkAndMerge({
        startTime: existing.startTime,
        endTime: existing.endTime,
        self: existing,
      });
      if (merged) {
        return merged;
      }

      const updated = WorkSession.create({
        id: existing.id,
        workSessionStateId: inProgressState.id,
        startTime: existing.startTime,
        endTime: existing.endTime,
        completedAt: null,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        wrapUpAt: existing.wrapUpAt,
        rescheduleAt: existing.rescheduleAt,
        waitConfirmAt: existing.waitConfirmAt,
        skippedAt: existing.skippedAt,
        createdAt: existing.createdAt,
      });

      return { session: this.repository.update(updated), mergedFrom: [] };
    })();
  }
}
