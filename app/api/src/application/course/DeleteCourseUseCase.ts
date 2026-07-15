import type { ICourseRepository } from "../../infrastructure/database/repositories/CourseRepository";

export class DeleteCourseUseCase {
  constructor(private readonly repository: ICourseRepository) {}

  execute(id: string): void {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new Error(`Course with id ${id} not found`);
    }
  }
}
