import { Event } from "../../domain/event/Event";
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

    return this.repository.update(updated);
  }
}
