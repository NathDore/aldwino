import type { Database } from "bun:sqlite";
import { WorkSession } from "../../domain/workSession/WorkSession";
import { WorkSessionNotCompletedError } from "../../domain/workSession/WorkSessionError";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { Clock } from "../health/ports/Clock";

export class WrapUpWorkSessionUseCase {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(id: string): WorkSession {
    return this.db.transaction(() => {
      const existing = this.repository.getById(id);
      if (!existing) {
        throw new Error(`WorkSession with id ${id} not found`);
      }
      if (existing.completedAt === null) {
        throw new WorkSessionNotCompletedError();
      }

      const now = this.clock.now();
      const wrappedUp = WorkSession.create({
        id: existing.id,
        workSessionStateId: existing.workSessionStateId,
        startTime: existing.startTime,
        endTime: existing.endTime,
        completedAt: existing.completedAt,
        isDeleted: true,
        deletedAt: now,
        wrapUpAt: now,
        createdAt: existing.createdAt,
      });

      return this.repository.update(wrappedUp);
    })();
  }
}
