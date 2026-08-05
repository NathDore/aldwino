import type { Database } from "bun:sqlite";
import { WorkSession } from "../../domain/workSession/WorkSession";
import {
  validateStartTime,
  validateEndTime,
  validateStartBeforeEnd,
} from "../../domain/workSession/WorkSessionRules";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";

export class RescheduleWorkSessionUseCase {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly db: Database,
  ) {}

  execute(params: { id: string; startTime: Date; endTime: Date }): WorkSession {
    return this.db.transaction(() => {
      const existing = this.repository.getById(params.id);
      if (!existing) {
        throw new Error(`WorkSession with id ${params.id} not found`);
      }

      validateStartTime(params.startTime);
      validateEndTime(params.endTime);
      validateStartBeforeEnd(params.startTime, params.endTime);

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

      return this.repository.update(updated);
    })();
  }
}
