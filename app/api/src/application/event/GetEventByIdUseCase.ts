import { Event } from "../../domain/event/Event";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IEventRepository } from "../../infrastructure/database/repositories/EventRepository";
import type { Clock } from "../health/ports/Clock";
import { recomputeEventStatus } from "./recomputeEventStatus";

export class GetEventByIdUseCase {
  constructor(
    private readonly repository: IEventRepository,
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly clock: Clock,
  ) {}

  execute(id: string): Event | null {
    const event = this.repository.getById(id);
    if (!event) {
      return null;
    }
    return recomputeEventStatus(event, this.assignmentRepository, this.repository, this.clock.now());
  }
}
