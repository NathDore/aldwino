import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { AssignmentWorkSession } from "../../domain/assignmentWorkSession/AssignmentWorkSession";
import { assertCanDelete } from "../../domain/assignment/AssignmentLifecycle";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IAssignmentWorkSessionRepository } from "../../infrastructure/database/repositories/AssignmentWorkSessionRepository";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

export class DeleteAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly assignmentWorkSessionRepository: IAssignmentWorkSessionRepository,
    private readonly notificationRepository: INotificationRepository,
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
      assertCanDelete(existing, now);

      const deleted = Assignment.create({
        id: existing.id,
        courseId: existing.courseId,
        assignmentStateId: existing.assignmentStateId,
        name: existing.name,
        dueDate: existing.dueDate,
        completedAt: existing.completedAt,
        isDeleted: true,
        deletedAt: now,
        wrapUpAt: existing.wrapUpAt,
        rescheduleAt: existing.rescheduleAt,
        createdAt: existing.createdAt,
      });
      const updated = this.repository.update(deleted);
      this.notificationRepository.softDeleteAllForEntity("ASSIGNMENT", id, now);

      for (const link of this.assignmentWorkSessionRepository.getByAssignmentId(id)) {
        this.assignmentWorkSessionRepository.update(
          AssignmentWorkSession.create({
            id: link.id,
            assignmentId: link.assignmentId,
            workSessionId: link.workSessionId,
            isDeleted: true,
            deletedAt: now,
            createdAt: link.createdAt,
            workedOn: link.workedOn,
            detachReason: "MANUAL",
          }),
        );
      }

      this.relabelStaleCompletionLinks(id);

      return updated;
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
