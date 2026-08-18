import type { Database } from "bun:sqlite";
import { AssignmentWorkSession } from "../../domain/assignmentWorkSession/AssignmentWorkSession";
import {
  AssignmentNotFoundError,
  WorkSessionNotFoundError,
  WorkSessionCompletedError,
} from "../../domain/assignmentWorkSession/AssignmentWorkSessionError";
import type { IAssignmentWorkSessionRepository } from "../../infrastructure/database/repositories/AssignmentWorkSessionRepository";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { Clock } from "../health/ports/Clock";

export class CreateAssignmentWorkSessionUseCase {
  constructor(
    private readonly repository: IAssignmentWorkSessionRepository,
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly workSessionRepository: IWorkSessionRepository,
    private readonly clock: Clock,
    private readonly db: Database,
  ) {}

  execute(params: { assignmentId: string; workSessionId: string }): AssignmentWorkSession {
    return this.db.transaction(() => {
      if (!this.assignmentRepository.getById(params.assignmentId)) {
        throw new AssignmentNotFoundError(params.assignmentId);
      }
      const workSession = this.workSessionRepository.getById(params.workSessionId);
      if (!workSession) {
        throw new WorkSessionNotFoundError(params.workSessionId);
      }
      if (workSession.completedAt !== null) {
        throw new WorkSessionCompletedError(params.workSessionId);
      }

      const id = crypto.randomUUID();
      const link = AssignmentWorkSession.create({
        id,
        assignmentId: params.assignmentId,
        workSessionId: params.workSessionId,
        createdAt: this.clock.now(),
      });
      return this.repository.create(link);
    })();
  }
}
