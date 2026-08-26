import { WorkSession } from "../../domain/workSession/WorkSession";
import { WorkSessionStateNotFoundError } from "../../domain/workSession/WorkSessionError";
import { Notification } from "../../domain/notification/Notification";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

export class CheckMissedWorkSessionsUseCase {
  constructor(
    private readonly workSessionRepository: IWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly clock: Clock,
  ) {}

  execute(): number {
    const now = this.clock.now();
    const waitConfirmState = this.workSessionStateRepository.findByState("WAIT_CONFIRM");
    if (!waitConfirmState) {
      throw new WorkSessionStateNotFoundError("WAIT_CONFIRM");
    }
    const inProgressState = this.workSessionStateRepository.findByState("INPROGRESS");
    if (!inProgressState) {
      throw new WorkSessionStateNotFoundError("INPROGRESS");
    }
    // Legacy sessions set to SKIPPED by the old client-side sync (removed) are migrated
    // to WAIT_CONFIRM here too, so they get a real notification and become reschedulable again.
    const skippedState = this.workSessionStateRepository.findByState("SKIPPED");

    let flagged = 0;
    for (const workSession of this.workSessionRepository.getAll()) {
      if (workSession.completedAt !== null) continue;

      const isOverdueInProgress = workSession.workSessionStateId === inProgressState.id && workSession.endTime < now;
      const isLegacySkipped = skippedState !== null && workSession.workSessionStateId === skippedState.id;
      if (!isOverdueInProgress && !isLegacySkipped) continue;

      this.workSessionRepository.update(
        WorkSession.create({
          id: workSession.id,
          workSessionStateId: waitConfirmState.id,
          startTime: workSession.startTime,
          endTime: workSession.endTime,
          completedAt: workSession.completedAt,
          isDeleted: workSession.isDeleted,
          deletedAt: workSession.deletedAt,
          wrapUpAt: workSession.wrapUpAt,
          rescheduleAt: workSession.rescheduleAt,
          createdAt: workSession.createdAt,
        }),
      );

      const alreadyNotified = this.notificationRepository.findUnreadByEntity(
        "WORK_SESSION",
        workSession.id,
        "WORK_SESSION_SKIPPED",
      );
      if (!alreadyNotified) {
        this.notificationRepository.create(
          Notification.create({
            id: crypto.randomUUID(),
            type: "WORK_SESSION_SKIPPED",
            entityType: "WORK_SESSION",
            entityId: workSession.id,
            createdAt: now,
          }),
        );
      }
      flagged++;
    }
    return flagged;
  }
}
