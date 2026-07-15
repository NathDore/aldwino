import { Course } from "../../domain/course/Course";
import { CourseCodeAlreadyExistsError } from "../../domain/course/CourseError";
import type { ICourseRepository } from "../../infrastructure/database/repositories/CourseRepository";
import type { Clock } from "../health/ports/Clock";

export class CreateCourseUseCase {
  constructor(
    private readonly repository: ICourseRepository,
    private readonly clock: Clock,
  ) {}

  execute(params: { color: string; code: string; title: string }): Course {
    if (this.repository.existsByCode(params.code)) {
      throw new CourseCodeAlreadyExistsError(params.code);
    }

    const id = crypto.randomUUID();
    const course = Course.create({
      id,
      color: params.color,
      code: params.code,
      title: params.title,
      createdAt: this.clock.now(),
    });
    return this.repository.create(course);
  }
}
