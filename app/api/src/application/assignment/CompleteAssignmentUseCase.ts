import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { AssignmentStateNotFoundError } from "../../domain/assignment/AssignmentError";
import { assertCanComplete } from "../../domain/assignment/AssignmentLifecycle";
import { AssignmentWorkSession } from "../../domain/assignmentWorkSession/AssignmentWorkSession";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IAssignmentStateRepository } from "../../infrastructure/database/repositories/AssignmentStateRepository";
import type { IAssignmentWorkSessionRepository } from "../../infrastructure/database/repositories/AssignmentWorkSessionRepository";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

export class CompleteAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly assignmentStateRepository: IAssignmentStateRepository,
    private readonly assignmentWorkSessionRepository: IAssignmentWorkSessionRepository,
    private readonly workSessionRepository: IWorkSessionRepository,
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

      const result = this.repository.update(updated);
      this.detachFromFutureWorkSessions(id, now);
      this.notificationRepository.markResolvedForEntity("ASSIGNMENT", id);
      return result;
    })();
  }

  private detachFromFutureWorkSessions(assignmentId: string, now: Date): void {
    const links = this.assignmentWorkSessionRepository.getByAssignmentId(assignmentId);
    for (const link of links) {
      const workSession = this.workSessionRepository.getById(link.workSessionId);
      if (!workSession || workSession.startTime.getTime() <= now.getTime()) {
        continue;
      }

      this.assignmentWorkSessionRepository.update(
        AssignmentWorkSession.create({
          id: link.id,
          assignmentId: link.assignmentId,
          workSessionId: link.workSessionId,
          isDeleted: true,
          deletedAt: now,
          createdAt: link.createdAt,
          workedOn: link.workedOn,
          detachReason: "COMPLETION",
        }),
      );
    }
  }
}
