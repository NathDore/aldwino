import { Assignment } from "../../domain/assignment/Assignment";
import { CourseNotFoundError, EventNotFoundError } from "../../domain/assignment/AssignmentError";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { ICourseRepository } from "../../infrastructure/database/repositories/CourseRepository";
import type { IEventRepository } from "../../infrastructure/database/repositories/EventRepository";
import type { Clock } from "../health/ports/Clock";

export class UpdateAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly eventRepository: IEventRepository,
    private readonly clock: Clock,
  ) {}

  execute(params: {
    id: string;
    courseId: string;
    eventId: string;
    description: string;
    dueDate: Date;
    isCompleted: boolean;
  }): Assignment {
    const existing = this.repository.getById(params.id);
    if (!existing) {
      throw new Error(`Assignment with id ${params.id} not found`);
    }

    if (params.courseId !== existing.courseId && !this.courseRepository.getById(params.courseId)) {
      throw new CourseNotFoundError(params.courseId);
    }
    if (params.eventId !== existing.eventId && !this.eventRepository.getById(params.eventId)) {
      throw new EventNotFoundError(params.eventId);
    }

    const completedAt = params.isCompleted
      ? (existing.isCompleted ? existing.completedAt : this.clock.now())
      : null;

    const updated = Assignment.create({
      id: existing.id,
      courseId: params.courseId,
      eventId: params.eventId,
      description: params.description,
      dueDate: params.dueDate,
      isCompleted: params.isCompleted,
      completedAt,
      createdAt: existing.createdAt,
    });

    return this.repository.update(updated);
  }
}
