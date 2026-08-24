import type { IAssignmentWorkSessionRepository } from "../../infrastructure/database/repositories/AssignmentWorkSessionRepository";
import type { Clock } from "../health/ports/Clock";

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export class PurgeDeletedAssignmentWorkSessionsUseCase {
  constructor(
    private readonly repository: IAssignmentWorkSessionRepository,
    private readonly clock: Clock,
  ) {}

  execute(): number {
    const cutoff = new Date(this.clock.now().getTime() - RETENTION_MS);
    return this.repository.purgeDeletedBefore(cutoff);
  }
}
