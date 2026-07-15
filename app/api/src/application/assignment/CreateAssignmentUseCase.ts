import { Assignment } from "../../domain/assignment/Assignment";
import { CourseNotFoundError, EventNotFoundError } from "../../domain/assignment/AssignmentError";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { ICourseRepository } from "../../infrastructure/database/repositories/CourseRepository";
import type { IEventRepository } from "../../infrastructure/database/repositories/EventRepository";
import type { Clock } from "../health/ports/Clock";

export class CreateAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly eventRepository: IEventRepository,
    private readonly clock: Clock,
  ) {}

  execute(params: {
    courseId: string;
    eventId: string;
    description: string;
    dueDate: Date;
  }): Assignment {
    if (!this.courseRepository.getById(params.courseId)) {
      throw new CourseNotFoundError(params.courseId);
    }
    if (!this.eventRepository.getById(params.eventId)) {
      throw new EventNotFoundError(params.eventId);
    }

    const id = crypto.randomUUID();
    const assignment = Assignment.create({
      id,
      courseId: params.courseId,
      eventId: params.eventId,
      description: params.description,
      dueDate: params.dueDate,
      createdAt: this.clock.now(),
    });
    return this.repository.create(assignment);
  }
}
