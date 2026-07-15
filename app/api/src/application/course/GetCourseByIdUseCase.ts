import { Course } from "../../domain/course/Course";
import type { ICourseRepository } from "../../infrastructure/database/repositories/CourseRepository";

export class GetCourseByIdUseCase {
  constructor(private readonly repository: ICourseRepository) {}

  execute(id: string): Course | null {
    return this.repository.getById(id);
  }
}
