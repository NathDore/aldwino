import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { validateCanBeDeleted } from "../../domain/assignment/AssignmentRules";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { Clock } from "../health/ports/Clock";
import type { AssignmentSchedulingService } from "./AssignmentSchedulingService";

export class DeleteAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly schedulingService: AssignmentSchedulingService,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(id: string): Assignment {
    return this.db.transaction(() => {
      const existing = this.repository.getById(id);
      if (!existing) {
        throw new Error(`Assignment with id ${id} not found`);
      }

      const isOverdue = !existing.isCompleted && existing.dueDate < this.clock.now();
      validateCanBeDeleted(existing.isCompleted, isOverdue);

      const deleted = Assignment.create({
        id: existing.id,
        courseId: existing.courseId,
        eventId: existing.eventId,
        description: existing.description,
        dueDate: existing.dueDate,
        startTime: existing.startTime,
        expectedDurationMinutes: existing.expectedDurationMinutes,
        isCompleted: existing.isCompleted,
        completedAt: existing.completedAt,
        isDeleted: true,
        deletedAt: this.clock.now(),
        isReschedule: existing.isReschedule,
        rescheduleAt: existing.rescheduleAt,
        createdAt: existing.createdAt,
      });

      const updated = this.repository.update(deleted);
      this.schedulingService.releaseSession(existing.id, existing.eventId);
      return updated;
    })();
  }
}
