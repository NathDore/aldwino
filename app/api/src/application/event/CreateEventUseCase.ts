import { Event } from "../../domain/event/Event";
import { EventOverlapError } from "../../domain/event/EventError";
import { eventsOverlap } from "../../domain/event/EventRules";
import type { IEventRepository } from "../../infrastructure/database/repositories/EventRepository";
import type { Clock } from "../health/ports/Clock";

export class CreateEventUseCase {
  constructor(
    private readonly repository: IEventRepository,
    private readonly clock: Clock,
  ) {}

  execute(params: { startTime: Date; endTime: Date }): Event {
    const id = crypto.randomUUID();
    const event = Event.create({
      id,
      startTime: params.startTime,
      endTime: params.endTime,
      createdAt: this.clock.now(),
    });

    const existingEvents = this.repository.getAll();
    if (existingEvents.some((existing) => eventsOverlap(existing, event))) {
      throw new EventOverlapError();
    }

    return this.repository.create(event);
  }
}
