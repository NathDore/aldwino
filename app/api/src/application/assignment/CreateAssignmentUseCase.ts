import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { CourseNotFoundError, AssignmentStateNotFoundError } from "../../domain/assignment/AssignmentError";
import { validateDueDateNotInPast } from "../../domain/assignment/AssignmentRules";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { ICourseRepository } from "../../infrastructure/database/repositories/CourseRepository";
import type { IAssignmentStateRepository } from "../../infrastructure/database/repositories/AssignmentStateRepository";
import type { Clock } from "../health/ports/Clock";

export class CreateAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly assignmentStateRepository: IAssignmentStateRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(params: { courseId: string; name: string; dueDate: Date }): Assignment {
    return this.db.transaction(() => {
      if (!this.courseRepository.getById(params.courseId)) {
        throw new CourseNotFoundError(params.courseId);
      }

      const now = this.clock.now();
      validateDueDateNotInPast(params.dueDate, now);

      // An assignment is always born UPCOMING: completion is only reachable
      // through CompleteAssignmentUseCase, which is guarded.
      const assignmentState = this.assignmentStateRepository.findByState("UNCOMPLETED");
      if (!assignmentState) {
        throw new AssignmentStateNotFoundError("UNCOMPLETED");
      }

      const assignment = Assignment.create({
        id: crypto.randomUUID(),
        courseId: params.courseId,
        assignmentStateId: assignmentState.id,
        name: params.name,
        dueDate: params.dueDate,
        completedAt: null,
        createdAt: now,
      });
      return this.repository.create(assignment);
    })();
  }
}
