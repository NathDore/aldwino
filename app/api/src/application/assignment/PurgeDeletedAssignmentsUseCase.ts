import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { Clock } from "../health/ports/Clock";

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export class PurgeDeletedAssignmentsUseCase {
  constructor(
    private readonly repository: IAssignmentRepository,
    private readonly clock: Clock,
  ) {}

  execute(): number {
    const cutoff = new Date(this.clock.now().getTime() - RETENTION_MS);
    return this.repository.purgeDeletedBefore(cutoff);
  }
}
