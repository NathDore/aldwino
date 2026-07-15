import { Event } from "../../domain/event/Event";
import type { IEventRepository } from "../../infrastructure/database/repositories/EventRepository";

export class GetEventByIdUseCase {
  constructor(private readonly repository: IEventRepository) {}

  execute(id: string): Event | null {
    return this.repository.getById(id);
  }
}
