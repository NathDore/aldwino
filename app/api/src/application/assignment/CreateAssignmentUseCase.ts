import type { Database } from "bun:sqlite";
import { Assignment } from "../../domain/assignment/Assignment";
import { CourseNotFoundError, AssignmentStateNotFoundError } from "../../domain/assignment/AssignmentError";
import { validateDueDate } from "../../domain/assignment/AssignmentRules";
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

  execute(params: {
    courseId: string;
    name: string;
    dueDate: Date;
    assignmentStateId?: string;
  }): Assignment {
    return this.db.transaction(() => {
      if (!this.courseRepository.getById(params.courseId)) {
        throw new CourseNotFoundError(params.courseId);
      }

      validateDueDate(params.dueDate);

      const assignmentState = params.assignmentStateId
        ? this.assignmentStateRepository.getById(params.assignmentStateId)
        : this.assignmentStateRepository.findByState("UNCOMPLETED");
      if (!assignmentState) {
        throw new AssignmentStateNotFoundError(params.assignmentStateId ?? "UNCOMPLETED");
      }

      const now = this.clock.now();
      const id = crypto.randomUUID();
      const assignment = Assignment.create({
        id,
        courseId: params.courseId,
        assignmentStateId: assignmentState.id,
        name: params.name,
        dueDate: params.dueDate,
        completedAt: assignmentState.state === "COMPLETED" ? now : null,
        createdAt: now,
      });
      return this.repository.create(assignment);
    })();
  }
}
