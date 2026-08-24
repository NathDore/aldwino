import type { IWorkSessionRepository } from "../../infrastructure/database/repositories/WorkSessionRepository";
import type { Clock } from "../health/ports/Clock";

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export class PurgeDeletedWorkSessionsUseCase {
  constructor(
    private readonly repository: IWorkSessionRepository,
    private readonly clock: Clock,
  ) {}

  execute(): number {
    const cutoff = new Date(this.clock.now().getTime() - RETENTION_MS);
    return this.repository.purgeDeletedBefore(cutoff);
  }
}
