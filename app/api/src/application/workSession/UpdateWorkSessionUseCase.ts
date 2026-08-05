import type { Database } from "bun:sqlite";
import { WorkSession } from "../../domain/workSession/WorkSession";
import { WorkSessionStateNotFoundError } from "../../domain/workSession/WorkSessionError";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { Clock } from "../health/ports/Clock";

export class UpdateWorkSessionUseCase {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(params: { id: string; startTime: Date; endTime: Date; workSessionStateId: string }): WorkSession {
    return this.db.transaction(() => {
      const existing = this.repository.getById(params.id);
      if (!existing) {
        throw new Error(`WorkSession with id ${params.id} not found`);
      }

      const workSessionState = this.workSessionStateRepository.getById(params.workSessionStateId);
      if (!workSessionState) {
        throw new WorkSessionStateNotFoundError(params.workSessionStateId);
      }

      const completedAt =
        workSessionState.state === "COMPLETED"
          ? existing.workSessionStateId === workSessionState.id
            ? existing.completedAt
            : this.clock.now()
          : null;

      const updated = WorkSession.create({
        id: existing.id,
        workSessionStateId: workSessionState.id,
        startTime: params.startTime,
        endTime: params.endTime,
        completedAt,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        createdAt: existing.createdAt,
      });

      return this.repository.update(updated);
    })();
  }
}
