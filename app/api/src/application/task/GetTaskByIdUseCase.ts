import { Task } from "../../domain/task/Task";
import type { ITaskRepository } from "../../infrastructure/database/repositories/TaskRepository";

export class GetTaskByIdUseCase {
  constructor(private readonly repository: ITaskRepository) {}

  execute(id: string): Task | null {
    return this.repository.getById(id);
  }
}
