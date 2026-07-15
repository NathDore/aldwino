import type { IEventRepository } from "../../infrastructure/database/repositories/EventRepository";

export class DeleteEventUseCase {
  constructor(private readonly repository: IEventRepository) {}

  execute(id: string): void {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new Error(`Event with id ${id} not found`);
    }
  }
}
