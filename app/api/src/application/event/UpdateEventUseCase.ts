import { Event } from "../../domain/event/Event";
import { EventOverlapError } from "../../domain/event/EventError";
import { eventsOverlap } from "../../domain/event/EventRules";
import type { IEventRepository } from "../../infrastructure/database/repositories/EventRepository";

export class UpdateEventUseCase {
  constructor(private readonly repository: IEventRepository) {}

  execute(params: { id: string; startTime: Date; endTime: Date }): Event {
    const existing = this.repository.getById(params.id);
    if (!existing) {
      throw new Error(`Event with id ${params.id} not found`);
    }

    const updated = Event.create({
      id: existing.id,
      startTime: params.startTime,
      endTime: params.endTime,
      createdAt: existing.createdAt,
    });

    const otherEvents = this.repository.getAll().filter((e) => e.id !== params.id);
    if (otherEvents.some((other) => eventsOverlap(other, updated))) {
      throw new EventOverlapError();
    }

    return this.repository.update(updated);
  }
}
