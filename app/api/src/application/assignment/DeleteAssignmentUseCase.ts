import type { Database } from "bun:sqlite";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { AssignmentSchedulingService } from "./AssignmentSchedulingService";

export class DeleteAssignmentUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly schedulingService: AssignmentSchedulingService,
    private readonly db: Database,
  ) {}

  execute(id: string): void {
    this.db.transaction(() => {
      const existing = this.repository.getById(id);
      if (!existing) {
        throw new Error(`Assignment with id ${id} not found`);
      }
      this.repository.delete(id);
      this.schedulingService.releaseSession(existing.id, existing.eventId);
    })();
  }
}
