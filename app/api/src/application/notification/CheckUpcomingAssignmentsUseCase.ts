import { Notification } from "../../domain/notification/Notification";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

const DUE_SOON_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

export class CheckUpcomingAssignmentsUseCase {
  constructor(
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly clock: Clock,
  ) {}

  execute(): number {
    const now = this.clock.now();

    let created = 0;
    for (const assignment of this.assignmentRepository.getAll()) {
      if (assignment.completedAt !== null) continue;
      const msUntilDue = assignment.dueDate.getTime() - now.getTime();
      if (msUntilDue <= 0 || msUntilDue > DUE_SOON_WINDOW_MS) continue;

      const alreadyNotified = this.notificationRepository.findUnreadByEntity(
        "ASSIGNMENT",
        assignment.id,
        "ASSIGNMENT_DUE_SOON",
      );
      if (alreadyNotified) continue;

      this.notificationRepository.create(
        Notification.create({
          id: crypto.randomUUID(),
          type: "ASSIGNMENT_DUE_SOON",
          entityType: "ASSIGNMENT",
          entityId: assignment.id,
          createdAt: now,
        }),
      );
      created++;
    }
    return created;
  }
}
