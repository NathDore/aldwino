import type { Database } from "bun:sqlite";
import { WorkSession } from "../../domain/workSession/WorkSession";
import { WorkSessionStateNotFoundError } from "../../domain/workSession/WorkSessionError";
import {
  validateStartTime,
  validateEndTime,
  validateStartBeforeEnd,
  validateSameDay,
} from "../../domain/workSession/WorkSessionRules";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { Clock } from "../health/ports/Clock";
import type { WorkSessionMergeService, WorkSessionMergeResult } from "./WorkSessionMergeService";

export class CreateWorkSessionUseCase {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
    private readonly mergeService: WorkSessionMergeService,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(params: { startTime: Date; endTime: Date; workSessionStateId?: string }): WorkSessionMergeResult {
    return this.db.transaction(() => {
      validateStartTime(params.startTime);
      validateEndTime(params.endTime);
      validateStartBeforeEnd(params.startTime, params.endTime);
      validateSameDay(params.startTime, params.endTime);

      const workSessionState = params.workSessionStateId
        ? this.workSessionStateRepository.getById(params.workSessionStateId)
        : this.workSessionStateRepository.findByState("INPROGRESS");
      if (!workSessionState) {
        throw new WorkSessionStateNotFoundError(params.workSessionStateId ?? "INPROGRESS");
      }

      if (workSessionState.state === "INPROGRESS") {
        const merged = this.mergeService.checkAndMerge({ startTime: params.startTime, endTime: params.endTime });
        if (merged) {
          return merged;
        }
      }

      const now = this.clock.now();
      const id = crypto.randomUUID();
      const workSession = WorkSession.create({
        id,
        workSessionStateId: workSessionState.id,
        startTime: params.startTime,
        endTime: params.endTime,
        completedAt: workSessionState.state === "COMPLETED" ? now : null,
        createdAt: now,
      });
      return { session: this.repository.create(workSession), mergedFrom: [] };
    })();
  }
}
