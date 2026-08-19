import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { CourseNotFoundError } from "../../domain/assignment/AssignmentError";
import { assertCanEdit } from "../../domain/assignment/AssignmentLifecycle";
import { validateDueDateNotInPast } from "../../domain/assignment/AssignmentRules";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { ICourseRepository } from "../../infrastructure/database/repositories/CourseRepository";
import type { Clock } from "../health/ports/Clock";

export class UpdateAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) { }
  execute(params: { id: string; courseId: string; name: string; dueDate: Date }): Assignment {
    return this.db.transaction(() => {
      const existing = this.repository.getById(params.id);
      if (!existing) {
        throw new Error(`Assignment with id ${params.id} not found`);
      }

      const now = this.clock.now();
      assertCanEdit(existing, now);

      if (params.courseId !== existing.courseId && !this.courseRepository.getById(params.courseId)) {
        throw new CourseNotFoundError(params.courseId);
      }

      validateDueDateNotInPast(params.dueDate, now);

      const updated = Assignment.create({
        id: existing.id,
        courseId: params.courseId,
        assignmentStateId: existing.assignmentStateId,
        name: params.name,
        dueDate: params.dueDate,
        completedAt: existing.completedAt,
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
