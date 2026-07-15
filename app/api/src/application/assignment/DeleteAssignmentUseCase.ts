import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";

export class DeleteAssignmentUseCase {
  constructor(private readonly repository: IAssignmentRepository) {}

  execute(id: string): void {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new Error(`Assignment with id ${id} not found`);
    }
  }
}
