import type { Database } from "bun:sqlite";
import { WorkSession } from "../../domain/workSession/WorkSession";
import { WorkSessionStateNotFoundError } from "../../domain/workSession/WorkSessionError";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { Clock } from "../health/ports/Clock";

export class CreateWorkSessionUseCase {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(params: { startTime: Date; endTime: Date; workSessionStateId?: string }): WorkSession {
    return this.db.transaction(() => {
      const workSessionState = params.workSessionStateId
        ? this.workSessionStateRepository.getById(params.workSessionStateId)
        : this.workSessionStateRepository.findByState("INPROGRESS");
      if (!workSessionState) {
        throw new WorkSessionStateNotFoundError(params.workSessionStateId ?? "INPROGRESS");
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
      return this.repository.create(workSession);
    })();
  }
}
