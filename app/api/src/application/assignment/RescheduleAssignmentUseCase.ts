import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import {
  validateStartTime,
  validateStartTimeNotInPast,
  validateExpectedDurationMinutes,
  validateSessionWithinSingleDay,
} from "../../domain/assignment/AssignmentRules";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { Clock } from "../health/ports/Clock";
import type { AssignmentSchedulingService } from "./AssignmentSchedulingService";

export class RescheduleAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly schedulingService: AssignmentSchedulingService,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(params: { id: string; startTime: Date; expectedDurationMinutes: number }): Assignment {
    return this.db.transaction(() => {
      const existing = this.repository.getById(params.id);
      if (!existing) {
        throw new Error(`Assignment with id ${params.id} not found`);
      }

      validateStartTime(params.startTime);
      const now = this.clock.now();
      if (params.startTime.getTime() !== existing.startTime.getTime()) {
        validateStartTimeNotInPast(params.startTime, now);
      }
      validateExpectedDurationMinutes(params.expectedDurationMinutes);
      const endTime = new Date(params.startTime.getTime() + params.expectedDurationMinutes * 60000);
      validateSessionWithinSingleDay(params.startTime, endTime);

      const eventId = this.schedulingService.rescheduleSession(
        existing.id,
        existing.eventId,
        params.startTime,
        endTime,
      );

      const updated = Assignment.create({
        id: existing.id,
        courseId: existing.courseId,
        eventId,
        description: existing.description,
        dueDate: existing.dueDate,
        startTime: params.startTime,
        expectedDurationMinutes: params.expectedDurationMinutes,
        isCompleted: existing.isCompleted,
        completedAt: existing.completedAt,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        isReschedule: true,
        rescheduleAt: now,
        createdAt: existing.createdAt,
      });

      return this.repository.update(updated);
    })();
  }
}
