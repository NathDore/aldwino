import { Assignment } from "../../domain/assignment/Assignment";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";

export class ListAssignmentsUseCase {
  constructor(private readonly repository: IAssignmentRepository) {}

  execute(): Assignment[] {
    return this.repository.getAll();
  }
}
