import type { Database } from "bun:sqlite";
import { WorkSession } from "../../domain/workSession/WorkSession";
import { WorkSessionStateNotFoundError } from "../../domain/workSession/WorkSessionError";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { Clock } from "../health/ports/Clock";
import type { WorkSessionMergeService, WorkSessionMergeResult } from "./WorkSessionMergeService";

export class ChangeWorkSessionStateUseCase {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
    private readonly mergeService: WorkSessionMergeService,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(params: { id: string; workSessionStateId: string }): WorkSessionMergeResult {
    return this.db.transaction(() => {
      const existing = this.repository.getById(params.id);
      if (!existing) {
        throw new Error(`WorkSession with id ${params.id} not found`);
      }

      const newState = this.workSessionStateRepository.getById(params.workSessionStateId);
      if (!newState) {
        throw new WorkSessionStateNotFoundError(params.workSessionStateId);
      }

      const completedAt =
        newState.state === "COMPLETED"
          ? existing.workSessionStateId === newState.id
            ? existing.completedAt
            : this.clock.now()
          : null;

      if (newState.state === "INPROGRESS") {
        const merged = this.mergeService.checkAndMerge({
          startTime: existing.startTime,
          endTime: existing.endTime,
          self: existing,
        });
        if (merged) {
          return merged;
        }
      }

      const updated = WorkSession.create({
        id: existing.id,
        workSessionStateId: newState.id,
        startTime: existing.startTime,
        endTime: existing.endTime,
        completedAt,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        createdAt: existing.createdAt,
      });

      return { session: this.repository.update(updated), mergedFrom: [] };
    })();
  }
}
