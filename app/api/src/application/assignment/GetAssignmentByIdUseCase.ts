import { Assignment } from "../../domain/assignment/Assignment";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";

export class GetAssignmentByIdUseCase {
  constructor(private readonly repository: IAssignmentRepository) {}

  execute(id: string): Assignment | null {
    return this.repository.getById(id);
  }
}
