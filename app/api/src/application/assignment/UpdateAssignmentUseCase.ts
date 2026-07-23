import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { CourseNotFoundError } from "../../domain/assignment/AssignmentError";
import {
  validateStartTime,
  validateExpectedDurationMinutes,
  validateSessionWithinSingleDay,
} from "../../domain/assignment/AssignmentRules";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { ICourseRepository } from "../../infrastructure/database/repositories/CourseRepository";
import type { Clock } from "../health/ports/Clock";
import type { AssignmentSchedulingService } from "./AssignmentSchedulingService";

export class UpdateAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly schedulingService: AssignmentSchedulingService,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(params: {
    id: string;
    courseId: string;
    description: string;
    dueDate: Date;
    startTime: Date;
    expectedDurationMinutes: number;
    isCompleted: boolean;
  }): Assignment {
    return this.db.transaction(() => {
      const existing = this.repository.getById(params.id);
      if (!existing) {
        throw new Error(`Assignment with id ${params.id} not found`);
      }

      if (params.courseId !== existing.courseId && !this.courseRepository.getById(params.courseId)) {
        throw new CourseNotFoundError(params.courseId);
      }

      validateStartTime(params.startTime);
      validateExpectedDurationMinutes(params.expectedDurationMinutes);
      const endTime = new Date(params.startTime.getTime() + params.expectedDurationMinutes * 60000);
      validateSessionWithinSingleDay(params.startTime, endTime);

      const eventId = this.schedulingService.rescheduleSession(
        existing.id,
        existing.eventId,
        params.startTime,
        endTime,
      );

      const completedAt = params.isCompleted
        ? (existing.isCompleted ? existing.completedAt : this.clock.now())
        : null;

      const updated = Assignment.create({
        id: existing.id,
        courseId: params.courseId,
        eventId,
        description: params.description,
        dueDate: params.dueDate,
        startTime: params.startTime,
        expectedDurationMinutes: params.expectedDurationMinutes,
        isCompleted: params.isCompleted,
        completedAt,
        createdAt: existing.createdAt,
      });

      return this.repository.update(updated);
    })();
  }
}
