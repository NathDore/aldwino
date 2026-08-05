import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { AssignmentStateNotFoundError } from "../../domain/assignment/AssignmentError";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IAssignmentStateRepository } from "../../infrastructure/database/repositories/AssignmentStateRepository";
import type { Clock } from "../health/ports/Clock";

export class ChangeAssignmentStateUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly assignmentStateRepository: IAssignmentStateRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(params: { id: string; assignmentStateId: string }): Assignment {
    return this.db.transaction(() => {
      const existing = this.repository.getById(params.id);
      if (!existing) {
        throw new Error(`Assignment with id ${params.id} not found`);
      }

      const assignmentState = this.assignmentStateRepository.getById(params.assignmentStateId);
      if (!assignmentState) {
        throw new AssignmentStateNotFoundError(params.assignmentStateId);
      }

      const completedAt =
        assignmentState.state === "COMPLETED"
          ? existing.assignmentStateId === assignmentState.id
            ? existing.completedAt
            : this.clock.now()
          : null;

      const updated = Assignment.create({
        id: existing.id,
        courseId: existing.courseId,
        assignmentStateId: assignmentState.id,
        name: existing.name,
        dueDate: existing.dueDate,
        completedAt,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        createdAt: existing.createdAt,
      });

      return this.repository.update(updated);
    })();
  }
}
