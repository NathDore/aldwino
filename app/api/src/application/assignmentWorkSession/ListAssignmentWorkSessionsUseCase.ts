import { AssignmentWorkSession } from "../../domain/assignmentWorkSession/AssignmentWorkSession";
import type { IAssignmentWorkSessionRepository } from "../../infrastructure/database/repositories/AssignmentWorkSessionRepository";

export class ListAssignmentWorkSessionsUseCase {
  constructor(private readonly repository: IAssignmentWorkSessionRepository) {}

  execute(params?: { workSessionId?: string }): AssignmentWorkSession[] {
    if (params?.workSessionId) {
      return this.repository.getByWorkSessionId(params.workSessionId);
    }
    return this.repository.getAll();
  }
}
