import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { assertCanWrapUpLate } from "../../domain/assignment/AssignmentLifecycle";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

export class WrapUpLateAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
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
      assertCanWrapUpLate(existing, now);

      const wrappedUp = Assignment.create({
        id: existing.id,
        courseId: existing.courseId,
        assignmentStateId: existing.assignmentStateId,
        name: existing.name,
        dueDate: existing.dueDate,
        completedAt: now,
        isDeleted: true,
        deletedAt: now,
        wrapUpAt: now,
        createdAt: existing.createdAt,
      });

      const result = this.repository.update(wrappedUp);
      this.notificationRepository.markAllReadForEntity("ASSIGNMENT", id);
      return result;
    })();
  }
}
