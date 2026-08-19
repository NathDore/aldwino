import type { Database } from "bun:sqlite";
import { AssignmentWorkSession } from "../../domain/assignmentWorkSession/AssignmentWorkSession";
import { WorkSessionCompletedError } from "../../domain/assignmentWorkSession/AssignmentWorkSessionError";
import { assertCanLink } from "../../domain/assignment/AssignmentLifecycle";
import type { IAssignmentWorkSessionRepository } from "../../infrastructure/database/repositories/AssignmentWorkSessionRepository";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { Clock } from "../health/ports/Clock";

export class DeleteAssignmentWorkSessionUseCase {
  constructor(
    private readonly repository: IAssignmentWorkSessionRepository,
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly workSessionRepository: IWorkSessionRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(id: string): AssignmentWorkSession {
    return this.db.transaction(() => {
      const existing = this.repository.getById(id);
      if (!existing) {
        throw new Error(`AssignmentWorkSession with id ${id} not found`);
      }

      const now = this.clock.now();

      // Unlinking is the popover's "Remove" action, so it follows the same
      // lifecycle rule as removing the assignment itself.
      const assignment = this.assignmentRepository.getById(existing.assignmentId);
      if (assignment) {
        assertCanLink(assignment, now);
      }

      const workSession = this.workSessionRepository.getById(existing.workSessionId);
      if (workSession && workSession.completedAt !== null) {
        throw new WorkSessionCompletedError(existing.workSessionId);
      }

      const deleted = AssignmentWorkSession.create({
        id: existing.id,
        assignmentId: existing.assignmentId,
        workSessionId: existing.workSessionId,
        isDeleted: true,
        deletedAt: now,
        createdAt: existing.createdAt,
      });

      return this.repository.update(deleted);
    })();
  }
}
