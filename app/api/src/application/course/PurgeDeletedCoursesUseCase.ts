import type { ICourseRepository } from "../../infrastructure/database/repositories/CourseRepository";
import type { Clock } from "../health/ports/Clock";

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export class PurgeDeletedCoursesUseCase {
  constructor(
    private readonly repository: ICourseRepository,
    private readonly clock: Clock,
  ) {}

  execute(): number {
    const cutoff = new Date(this.clock.now().getTime() - RETENTION_MS);
    return this.repository.purgeDeletedBefore(cutoff);
  }
}
