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

export class CreateAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly schedulingService: AssignmentSchedulingService,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(params: {
    courseId: string;
    description: string;
    dueDate: Date;
    startTime: Date;
    expectedDurationMinutes: number;
  }): Assignment {
    return this.db.transaction(() => {
      if (!this.courseRepository.getById(params.courseId)) {
        throw new CourseNotFoundError(params.courseId);
      }

      validateStartTime(params.startTime);
      validateExpectedDurationMinutes(params.expectedDurationMinutes);
      const endTime = new Date(params.startTime.getTime() + params.expectedDurationMinutes * 60000);
      validateSessionWithinSingleDay(params.startTime, endTime);

      const eventId = this.schedulingService.placeNewSession(params.startTime, endTime);

      const id = crypto.randomUUID();
      const assignment = Assignment.create({
        id,
        courseId: params.courseId,
        eventId,
        description: params.description,
        dueDate: params.dueDate,
        startTime: params.startTime,
        expectedDurationMinutes: params.expectedDurationMinutes,
        createdAt: this.clock.now(),
      });
      return this.repository.create(assignment);
    })();
  }
}
