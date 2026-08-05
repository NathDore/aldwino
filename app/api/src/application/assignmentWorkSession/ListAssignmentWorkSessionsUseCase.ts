import { AssignmentWorkSession } from "../../domain/assignmentWorkSession/AssignmentWorkSession";
import type { IAssignmentWorkSessionRepository } from "../../infrastructure/database/repositories/AssignmentWorkSessionRepository";

export class ListAssignmentWorkSessionsUseCase {
  constructor(private readonly repository: IAssignmentWorkSessionRepository) {}

  execute(): AssignmentWorkSession[] {
    return this.repository.getAll();
  }
}
