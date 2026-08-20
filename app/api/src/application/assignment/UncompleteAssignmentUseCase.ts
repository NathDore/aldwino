import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { AssignmentStateNotFoundError } from "../../domain/assignment/AssignmentError";
import { assertCanUncomplete } from "../../domain/assignment/AssignmentLifecycle";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IAssignmentStateRepository } from "../../infrastructure/database/repositories/AssignmentStateRepository";
import type { Clock } from "../health/ports/Clock";

export class UncompleteAssignmentUseCase {
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

      assertCanUncomplete(existing, this.clock.now());

      const uncompletedState = this.assignmentStateRepository.findByState("UNCOMPLETED");
      if (!uncompletedState) {
        throw new AssignmentStateNotFoundError("UNCOMPLETED");
      }

      const updated = Assignment.create({
        id: existing.id,
        courseId: existing.courseId,
        assignmentStateId: uncompletedState.id,
        name: existing.name,
        dueDate: existing.dueDate,
        completedAt: null,
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
