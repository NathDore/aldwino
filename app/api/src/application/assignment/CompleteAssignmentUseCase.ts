import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { AssignmentStateNotFoundError } from "../../domain/assignment/AssignmentError";
import { assertCanComplete } from "../../domain/assignment/AssignmentLifecycle";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IAssignmentStateRepository } from "../../infrastructure/database/repositories/AssignmentStateRepository";
import type { Clock } from "../health/ports/Clock";

export class CompleteAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly assignmentStateRepository: IAssignmentStateRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(id: string): Assignment {
    return this.db.transaction(() => {
      const existing = this.repository.getById(id);
      if (!existing) {
        throw new Error(`Assignment with id ${id} not found`);
      }

      const now = this.clock.now();
      assertCanComplete(existing, now);

      const completedState = this.assignmentStateRepository.findByState("COMPLETED");
      if (!completedState) {
        throw new AssignmentStateNotFoundError("COMPLETED");
      }

      const updated = Assignment.create({
        id: existing.id,
        courseId: existing.courseId,
        assignmentStateId: completedState.id,
        name: existing.name,
        dueDate: existing.dueDate,
        completedAt: now,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        wrapUpAt: existing.wrapUpAt,
        rescheduleAt: existing.rescheduleAt,
        createdAt: existing.createdAt,
      });

      return this.repository.update(updated);
    })();
  }
}
