import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { AssignmentNotCompletedError } from "../../domain/assignment/AssignmentError";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { Clock } from "../health/ports/Clock";

export class WrapUpAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(id: string): Assignment {
    return this.db.transaction(() => {
      const existing = this.repository.getById(id);
      if (!existing) {
        throw new Error(`Assignment with id ${id} not found`);
      }
      if (existing.completedAt === null) {
        throw new AssignmentNotCompletedError();
      }

      const now = this.clock.now();
      const wrappedUp = Assignment.create({
        id: existing.id,
        courseId: existing.courseId,
        assignmentStateId: existing.assignmentStateId,
        name: existing.name,
        dueDate: existing.dueDate,
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
