import { Assignment } from "../../domain/assignment/Assignment";
import { AssignmentStateNotFoundError } from "../../domain/assignment/AssignmentError";
import { Notification } from "../../domain/notification/Notification";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IAssignmentStateRepository } from "../../infrastructure/database/repositories/AssignmentStateRepository";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

export class CheckOverdueAssignmentsUseCase {
  constructor(
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly assignmentStateRepository: IAssignmentStateRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly clock: Clock,
  ) {}

  execute(): number {
    const now = this.clock.now();
    const waitConfirmState = this.assignmentStateRepository.findByState("WAIT_CONFIRM");
    if (!waitConfirmState) {
      throw new AssignmentStateNotFoundError("WAIT_CONFIRM");
    }

    let flagged = 0;
    for (const assignment of this.assignmentRepository.getAll()) {
      if (assignment.completedAt !== null) continue;
      if (assignment.dueDate >= now) continue;
      if (assignment.assignmentStateId === waitConfirmState.id) continue;

      this.assignmentRepository.update(
        Assignment.create({
          id: assignment.id,
          courseId: assignment.courseId,
          assignmentStateId: waitConfirmState.id,
          name: assignment.name,
          dueDate: assignment.dueDate,
          completedAt: assignment.completedAt,
          isDeleted: assignment.isDeleted,
          deletedAt: assignment.deletedAt,
          wrapUpAt: assignment.wrapUpAt,
          rescheduleAt: assignment.rescheduleAt,
          createdAt: assignment.createdAt,
        }),
      );

      const alreadyNotified = this.notificationRepository.findUnreadByEntity(
        "ASSIGNMENT",
        assignment.id,
        "ASSIGNMENT_OVERDUE",
      );
      if (!alreadyNotified) {
        this.notificationRepository.create(
          Notification.create({
            id: crypto.randomUUID(),
            type: "ASSIGNMENT_OVERDUE",
            entityType: "ASSIGNMENT",
            entityId: assignment.id,
            createdAt: now,
          }),
        );
      }
      flagged++;
    }
    return flagged;
  }
}
