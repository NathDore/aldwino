import { Task } from "../../domain/task/Task";
import { AssignmentNotFoundError } from "../../domain/task/TaskError";
import type { ITaskRepository } from "../../infrastructure/database/repositories/TaskRepository";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";

export class UpdateTaskUseCase {
  constructor(
    private readonly repository: ITaskRepository,
    private readonly assignmentRepository: IAssignmentRepository,
  ) {}

  execute(params: {
    id: string;
    assignmentId: string;
    description: string;
    isCompleted: boolean;
  }): Task {
    const existing = this.repository.getById(params.id);
    if (!existing) {
      throw new Error(`Task with id ${params.id} not found`);
    }

    if (
      params.assignmentId !== existing.assignmentId &&
      !this.assignmentRepository.getById(params.assignmentId)
    ) {
      throw new AssignmentNotFoundError(params.assignmentId);
    }

    const updated = Task.create({
      id: existing.id,
      assignmentId: params.assignmentId,
      description: params.description,
      isCompleted: params.isCompleted,
      createdAt: existing.createdAt,
    });

    return this.repository.update(updated);
  }
}
