import type { ITaskRepository } from "../../infrastructure/database/repositories/TaskRepository";

export class DeleteTaskUseCase {
  constructor(private readonly repository: ITaskRepository) {}

  execute(id: string): void {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new Error(`Task with id ${id} not found`);
    }
  }
}
