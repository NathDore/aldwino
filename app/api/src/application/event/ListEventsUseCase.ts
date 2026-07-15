import { Event } from "../../domain/event/Event";
import type { IEventRepository } from "../../infrastructure/database/repositories/EventRepository";

export class ListEventsUseCase {
  constructor(private readonly repository: IEventRepository) {}

  execute(): Event[] {
    return this.repository.getAll();
  }
}
