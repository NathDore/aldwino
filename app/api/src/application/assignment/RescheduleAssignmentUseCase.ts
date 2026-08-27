import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { assertCanReschedule } from "../../domain/assignment/AssignmentLifecycle";
import { AssignmentStateNotFoundError } from "../../domain/assignment/AssignmentError";
import { validateDueDateNotInPast } from "../../domain/assignment/AssignmentRules";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IAssignmentStateRepository } from "../../infrastructure/database/repositories/AssignmentStateRepository";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

export class RescheduleAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly assignmentStateRepository: IAssignmentStateRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(params: { id: string; dueDate: Date }): Assignment {
    return this.db.transaction(() => {
      const existing = this.repository.getById(params.id);
      if (!existing) {
        throw new Error(`Assignment with id ${params.id} not found`);
      }

      const now = this.clock.now();
      assertCanReschedule(existing, now);
      validateDueDateNotInPast(params.dueDate, now);

      const uncompletedState = this.assignmentStateRepository.findByState("UNCOMPLETED");
      if (!uncompletedState) {
        throw new AssignmentStateNotFoundError("UNCOMPLETED");
      }

      const rescheduled = Assignment.create({
        id: existing.id,
        courseId: existing.courseId,
        assignmentStateId: uncompletedState.id,
        name: existing.name,
        dueDate: params.dueDate,
        completedAt: existing.completedAt,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        wrapUpAt: existing.wrapUpAt,
        rescheduleAt: now,
        createdAt: existing.createdAt,
      });

      const result = this.repository.update(rescheduled);
      this.notificationRepository.markAllReadForEntity("ASSIGNMENT", existing.id);
      return result;
    })();
  }
}
