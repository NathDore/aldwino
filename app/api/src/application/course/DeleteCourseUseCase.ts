import type { Database } from "bun:sqlite";
import { Course } from "../../domain/course/Course";
import { Assignment } from "../../domain/assignment/Assignment";
import type { ICourseRepository } from "../../infrastructure/database/repositories/CourseRepository";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { INotificationRepository } from "../../infrastructure/database/repositories/NotificationRepository";
import type { Clock } from "../health/ports/Clock";

export class DeleteCourseUseCase {
  constructor(
    private readonly repository: ICourseRepository,
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(id: string): Course {
    return this.db.transaction(() => {
      const existing = this.repository.getById(id);
      if (!existing) {
        throw new Error(`Course with id ${id} not found`);
      }

      const now = this.clock.now();

      const deleted = Course.create({
        id: existing.id,
        color: existing.color,
        code: existing.code,
        title: existing.title,
        isDeleted: true,
        deletedAt: now,
        createdAt: existing.createdAt,
      });
      const updated = this.repository.update(deleted);

      for (const assignment of this.assignmentRepository.getByCourseId(id)) {
        this.assignmentRepository.update(
          Assignment.create({
            id: assignment.id,
            courseId: assignment.courseId,
            assignmentStateId: assignment.assignmentStateId,
            name: assignment.name,
            dueDate: assignment.dueDate,
            completedAt: assignment.completedAt,
            isDeleted: true,
            deletedAt: now,
            wrapUpAt: assignment.wrapUpAt,
            rescheduleAt: assignment.rescheduleAt,
            createdAt: assignment.createdAt,
          }),
        );
        this.notificationRepository.softDeleteAllForEntity("ASSIGNMENT", assignment.id, now);
      }

      return updated;
    })();
  }
}
