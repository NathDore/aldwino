import { Course } from "../../domain/course/Course";
import { CourseCodeAlreadyExistsError } from "../../domain/course/CourseError";
import type { ICourseRepository } from "../../infrastructure/database/repositories/CourseRepository";

export class UpdateCourseUseCase {
  constructor(private readonly repository: ICourseRepository) {}

  execute(params: { id: string; color: string; code: string; title: string }): Course {
    const existing = this.repository.getById(params.id);
    if (!existing) {
      throw new Error(`Course with id ${params.id} not found`);
    }

    if (params.code !== existing.code && this.repository.existsByCode(params.code, params.id)) {
      throw new CourseCodeAlreadyExistsError(params.code);
    }

    const updated = Course.create({
      id: existing.id,
      color: params.color,
      code: params.code,
      title: params.title,
      createdAt: existing.createdAt,
    });

    return this.repository.update(updated);
  }
}
