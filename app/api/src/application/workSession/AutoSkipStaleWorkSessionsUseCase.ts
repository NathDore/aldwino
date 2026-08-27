import { WorkSession } from "../../domain/workSession/WorkSession";
import { WorkSessionStateNotFoundError } from "../../domain/workSession/WorkSessionError";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { Clock } from "../health/ports/Clock";

const STALE_WAIT_CONFIRM_MS = 7 * 24 * 60 * 60 * 1000;

export class AutoSkipStaleWorkSessionsUseCase {
  constructor(
    private readonly workSessionRepository: IWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
    private readonly clock: Clock,
  ) {}

  execute(): number {
    const now = this.clock.now();
    const waitConfirmState = this.workSessionStateRepository.findByState("WAIT_CONFIRM");
    if (!waitConfirmState) {
      throw new WorkSessionStateNotFoundError("WAIT_CONFIRM");
    }
    const skippedState = this.workSessionStateRepository.findByState("SKIPPED");
    if (!skippedState) {
      throw new WorkSessionStateNotFoundError("SKIPPED");
    }

    let skipped = 0;
    for (const workSession of this.workSessionRepository.getAll()) {
      if (workSession.workSessionStateId !== waitConfirmState.id) continue;
      if (!workSession.waitConfirmAt) continue;
      if (now.getTime() - workSession.waitConfirmAt.getTime() < STALE_WAIT_CONFIRM_MS) continue;

      this.workSessionRepository.update(
        WorkSession.create({
          id: workSession.id,
          workSessionStateId: skippedState.id,
          startTime: workSession.startTime,
          endTime: workSession.endTime,
          completedAt: workSession.completedAt,
          isDeleted: workSession.isDeleted,
          deletedAt: workSession.deletedAt,
          wrapUpAt: workSession.wrapUpAt,
          rescheduleAt: workSession.rescheduleAt,
          waitConfirmAt: null,
          skippedAt: now,
          createdAt: workSession.createdAt,
        }),
      );
      skipped++;
    }
    return skipped;
  }
}
