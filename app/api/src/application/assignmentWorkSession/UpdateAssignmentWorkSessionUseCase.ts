import type { Database } from "bun:sqlite";
import { AssignmentWorkSession } from "../../domain/assignmentWorkSession/AssignmentWorkSession";
import {
  AssignmentNotFoundError,
  WorkSessionNotFoundError,
} from "../../domain/assignmentWorkSession/AssignmentWorkSessionError";
import type { IAssignmentWorkSessionRepository } from "../../infrastructure/database/repositories/AssignmentWorkSessionRepository";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";

export class UpdateAssignmentWorkSessionUseCase {
  constructor(
    private readonly repository: IAssignmentWorkSessionRepository,
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly workSessionRepository: IWorkSessionRepository,
    private readonly db: Database,
  ) {}

  execute(params: { id: string; assignmentId: string; workSessionId: string }): AssignmentWorkSession {
    return this.db.transaction(() => {
      const existing = this.repository.getById(params.id);
      if (!existing) {
        throw new Error(`AssignmentWorkSession with id ${params.id} not found`);
      }

      if (!this.assignmentRepository.getById(params.assignmentId)) {
        throw new AssignmentNotFoundError(params.assignmentId);
      }
      if (!this.workSessionRepository.getById(params.workSessionId)) {
        throw new WorkSessionNotFoundError(params.workSessionId);
      }

      const updated = AssignmentWorkSession.create({
        id: existing.id,
        assignmentId: params.assignmentId,
        workSessionId: params.workSessionId,
        isDeleted: existing.isDeleted,
        deletedAt: existing.deletedAt,
        createdAt: existing.createdAt,
        workedOn: existing.workedOn,
      });

      return this.repository.update(updated);
    })();
  }
}
