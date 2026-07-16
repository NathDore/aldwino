import { Task } from "../../domain/task/Task";
import type { ITaskRepository } from "../../infrastructure/database/repositories/TaskRepository";

export class ListTasksUseCase {
  constructor(private readonly repository: ITaskRepository) {}

  execute(): Task[] {
    return this.repository.getAll();
  }
}
