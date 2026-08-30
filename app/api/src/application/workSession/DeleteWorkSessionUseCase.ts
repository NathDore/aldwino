import type { Database } from "bun:sqlite";
import { WorkSession } from "../../domain/workSession/WorkSession";
import { AssignmentWorkSession } from "../../domain/assignmentWorkSession/AssignmentWorkSession";
import { CannotDeleteNonInProgressWorkSessionError } from "../../domain/workSession/WorkSessionError";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { IWorkSessionStateRepository } from "../../infrastructure/database/repositories/WorkSessionStateRepository";
import type { IAssignmentWorkSessionRepository } from "../../infrastructure/database/repositories/AssignmentWorkSessionRepository";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

export class DeleteWorkSessionUseCase {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly workSessionStateRepository: IWorkSessionStateRepository,
    private readonly assignmentWorkSessionRepository: IAssignmentWorkSessionRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(id: string): WorkSession {
    return this.db.transaction(() => {
      const existing = this.repository.getById(id);
      if (!existing) {
        throw new Error(`WorkSession with id ${id} not found`);
      }

      const currentState = this.workSessionStateRepository.getById(existing.workSessionStateId);
      if (currentState?.state !== "INPROGRESS") {
        throw new CannotDeleteNonInProgressWorkSessionError(currentState?.state ?? "UNKNOWN");
      }

      const now = this.clock.now();

      const deleted = WorkSession.create({
        id: existing.id,
        workSessionStateId: existing.workSessionStateId,
        startTime: existing.startTime,
        endTime: existing.endTime,
        completedAt: existing.completedAt,
        isDeleted: true,
        deletedAt: now,
        wrapUpAt: existing.wrapUpAt,
        rescheduleAt: existing.rescheduleAt,
        waitConfirmAt: existing.waitConfirmAt,
        skippedAt: existing.skippedAt,
        createdAt: existing.createdAt,
      });
      const updated = this.repository.update(deleted);

      for (const link of this.assignmentWorkSessionRepository.getByWorkSessionId(id)) {
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
      this.notificationRepository.softDeleteAllForEntity("WORK_SESSION", id, now);

      return updated;
    })();
  }

  private relabelStaleCompletionLinks(workSessionId: string): void {
    const links = this.assignmentWorkSessionRepository.getDetachedByWorkSessionIdAndReason(
      workSessionId,
      "COMPLETION",
    );
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
