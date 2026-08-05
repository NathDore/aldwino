import { AssignmentState } from "../../domain/assignmentState/AssignmentState";
import type { IAssignmentStateRepository } from "../../infrastructure/database/repositories/AssignmentStateRepository";

export class ListAssignmentStatesUseCase {
  constructor(private readonly repository: IAssignmentStateRepository) {}

  execute(): AssignmentState[] {
    return this.repository.getAll();
  }
}
