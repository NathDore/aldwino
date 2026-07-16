import { Task } from "../../domain/task/Task";
import { AssignmentNotFoundError } from "../../domain/task/TaskError";
import type { ITaskRepository } from "../../infrastructure/database/repositories/TaskRepository";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { Clock } from "../health/ports/Clock";

export class CreateTaskUseCase {
  constructor(
    private readonly repository: ITaskRepository,
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly clock: Clock,
  ) {}

  execute(params: { assignmentId: string; description: string }): Task {
    if (!this.assignmentRepository.getById(params.assignmentId)) {
      throw new AssignmentNotFoundError(params.assignmentId);
    }

    const id = crypto.randomUUID();
    const task = Task.create({
      id,
      assignmentId: params.assignmentId,
      description: params.description,
      createdAt: this.clock.now(),
    });
    return this.repository.create(task);
  }
}
