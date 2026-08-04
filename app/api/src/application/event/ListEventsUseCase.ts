import { Event } from "../../domain/event/Event";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IEventRepository } from "../../infrastructure/database/repositories/EventRepository";
import type { Clock } from "../health/ports/Clock";
import { recomputeEventStatus } from "./recomputeEventStatus";

export class ListEventsUseCase {
  constructor(
    private readonly repository: IEventRepository,
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly clock: Clock,
  ) {}

  execute(): Event[] {
    const now = this.clock.now();
    return this.repository
      .getAll()
      .map((event) => recomputeEventStatus(event, this.assignmentRepository, this.repository, now));
  }
}
