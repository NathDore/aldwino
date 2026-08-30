import { WorkSession } from "../../domain/workSession/WorkSession";
import { AssignmentWorkSession } from "../../domain/assignmentWorkSession/AssignmentWorkSession";
import { WorkSessionStateNotFoundError } from "../../domain/workSession/WorkSessionError";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { IAssignmentWorkSessionRepository } from "../../infrastructure/database/repositories/AssignmentWorkSessionRepository";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

const STALE_SKIPPED_MS = 7 * 24 * 60 * 60 * 1000;

export class AutoWrapUpLateStaleWorkSessionsUseCase {
  constructor(
    private readonly workSessionRepository: IWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
    private readonly assignmentWorkSessionRepository: IAssignmentWorkSessionRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly clock: Clock,
  ) {}

  execute(): number {
    const now = this.clock.now();
    const skippedState = this.workSessionStateRepository.findByState("SKIPPED");
    if (!skippedState) {
      throw new WorkSessionStateNotFoundError("SKIPPED");
    }

    let wrappedUp = 0;
    for (const workSession of this.workSessionRepository.getAll()) {
      if (workSession.workSessionStateId !== skippedState.id) continue;
      if (!workSession.skippedAt) continue;
      if (now.getTime() - workSession.skippedAt.getTime() < STALE_SKIPPED_MS) continue;

      this.workSessionRepository.update(
        WorkSession.create({
          id: workSession.id,
          workSessionStateId: workSession.workSessionStateId,
          startTime: workSession.startTime,
          endTime: workSession.endTime,
          completedAt: workSession.completedAt,
          isDeleted: true,
          deletedAt: now,
          wrapUpAt: workSession.wrapUpAt,
          rescheduleAt: workSession.rescheduleAt,
          waitConfirmAt: workSession.waitConfirmAt,
          skippedAt: workSession.skippedAt,
          createdAt: workSession.createdAt,
        }),
      );

      for (const link of this.assignmentWorkSessionRepository.getByWorkSessionId(workSession.id)) {
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

      this.notificationRepository.softDeleteAllForEntity("WORK_SESSION", workSession.id, now);
      wrappedUp++;
    }
    return wrappedUp;
  }
}
