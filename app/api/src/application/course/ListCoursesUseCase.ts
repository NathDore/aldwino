import { Course } from "../../domain/course/Course";
import type { ICourseRepository } from "../../infrastructure/database/repositories/CourseRepository";

export class ListCoursesUseCase {
  constructor(private readonly repository: ICourseRepository) {}

  execute(): Course[] {
    return this.repository.getAll();
  }
}
