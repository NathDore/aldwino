import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { CourseNotFoundError, AssignmentStateNotFoundError } from "../../domain/assignment/AssignmentError";
import { validateDueDate } from "../../domain/assignment/AssignmentRules";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { ICourseRepository } from "../../infrastructure/database/repositories/CourseRepository";
import type { IAssignmentStateRepository } from "../../infrastructure/database/repositories/AssignmentStateRepository";
import type { Clock } from "../health/ports/Clock";

export class UpdateAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly assignmentStateRepository: IAssignmentStateRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(params: {
    id: string;
    courseId: string;
    name: string;
    dueDate: Date;
    assignmentStateId: string;
  }): Assignment {
    return this.db.transaction(() => {
      const existing = this.repository.getById(params.id);
      if (!existing) {
        throw new Error(`Assignment with id ${params.id} not found`);
      }

      if (params.courseId !== existing.courseId && !this.courseRepository.getById(params.courseId)) {
        throw new CourseNotFoundError(params.courseId);
      }

      validateDueDate(params.dueDate);

      const assignmentState = this.assignmentStateRepository.getById(params.assignmentStateId);
      if (!assignmentState) {
        throw new AssignmentStateNotFoundError(params.assignmentStateId);
      }

      const completedAt =
        assignmentState.state === "COMPLETED"
          ? existing.assignmentStateId === assignmentState.id
            ? existing.completedAt
            : this.clock.now()
          : null;

      const updated = Assignment.create({
        id: existing.id,
        courseId: params.courseId,
        assignmentStateId: assignmentState.id,
        name: params.name,
        dueDate: params.dueDate,
        completedAt,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        wrapUpAt: existing.wrapUpAt,
        rescheduleAt: existing.rescheduleAt,
        createdAt: existing.createdAt,
      });

      return this.repository.update(updated);
    })();
  }
}
