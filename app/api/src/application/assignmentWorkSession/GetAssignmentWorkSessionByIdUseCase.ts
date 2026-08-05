import { AssignmentWorkSession } from "../../domain/assignmentWorkSession/AssignmentWorkSession";
import type { IAssignmentWorkSessionRepository } from "../../infrastructure/database/repositories/AssignmentWorkSessionRepository";

export class GetAssignmentWorkSessionByIdUseCase {
  constructor(private readonly repository: IAssignmentWorkSessionRepository) {}

  execute(id: string): AssignmentWorkSession | null {
    return this.repository.getById(id);
  }
}
