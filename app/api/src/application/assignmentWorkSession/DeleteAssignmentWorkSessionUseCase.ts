import type { Database } from "bun:sqlite";
import { AssignmentWorkSession } from "../../domain/assignmentWorkSession/AssignmentWorkSession";
import type { IAssignmentWorkSessionRepository } from "../../infrastructure/database/repositories/AssignmentWorkSessionRepository";
import type { Clock } from "../health/ports/Clock";

export class DeleteAssignmentWorkSessionUseCase {
  constructor(
    private readonly repository: IAssignmentWorkSessionRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(id: string): AssignmentWorkSession {
    return this.db.transaction(() => {
      const existing = this.repository.getById(id);
      if (!existing) {
        throw new Error(`AssignmentWorkSession with id ${id} not found`);
      }

      const deleted = AssignmentWorkSession.create({
        id: existing.id,
        assignmentId: existing.assignmentId,
        workSessionId: existing.workSessionId,
        isDeleted: true,
        deletedAt: this.clock.now(),
        createdAt: existing.createdAt,
      });

      return this.repository.update(deleted);
    })();
  }
}
