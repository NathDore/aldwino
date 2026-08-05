import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { Clock } from "../health/ports/Clock";

export class CompleteAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(params: { id: string; isCompleted: boolean }): Assignment {
    return this.db.transaction(() => {
      const existing = this.repository.getById(params.id);
      if (!existing) {
        throw new Error(`Assignment with id ${params.id} not found`);
      }

      const completedAt = params.isCompleted
        ? (existing.isCompleted ? existing.completedAt : this.clock.now())
        : null;

      const updated = Assignment.create({
        id: existing.id,
        courseId: existing.courseId,
        eventId: existing.eventId,
        description: existing.description,
        dueDate: existing.dueDate,
        startTime: existing.startTime,
        expectedDurationMinutes: existing.expectedDurationMinutes,
        isCompleted: params.isCompleted,
        completedAt,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        isReschedule: existing.isReschedule,
        rescheduleAt: existing.rescheduleAt,
        createdAt: existing.createdAt,
      });

      return this.repository.update(updated);
    })();
  }
}
