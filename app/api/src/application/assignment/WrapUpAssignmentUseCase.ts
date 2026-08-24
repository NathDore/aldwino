import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { assertCanWrapUp } from "../../domain/assignment/AssignmentLifecycle";
import { AssignmentWorkSession } from "../../domain/assignmentWorkSession/AssignmentWorkSession";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IAssignmentWorkSessionRepository } from "../../infrastructure/database/repositories/AssignmentWorkSessionRepository";
import type { Clock } from "../health/ports/Clock";

export class WrapUpAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly assignmentWorkSessionRepository: IAssignmentWorkSessionRepository,
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
      assertCanWrapUp(existing, now);

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

      const result = this.repository.update(wrappedUp);
      this.relabelStaleCompletionLinks(id);
      return result;
    })();
  }

  private relabelStaleCompletionLinks(assignmentId: string): void {
    const links = this.assignmentWorkSessionRepository.getDetachedByAssignmentIdAndReason(assignmentId, "COMPLETION");
    for (const link of links) {
      this.assignmentWorkSessionRepository.update(
        AssignmentWorkSession.create({
          id: link.id,
          assignmentId: link.assignmentId,
          workSessionId: link.workSessionId,
          isDeleted: link.isDeleted,
          deletedAt: link.deletedAt,
          createdAt: link.createdAt,
          workedOn: link.workedOn,
          detachReason: "MANUAL",
        }),
      );
    }
  }
}
