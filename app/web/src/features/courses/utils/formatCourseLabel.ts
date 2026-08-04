import type { CourseDto } from "../types/course.types";

export function formatCourseLabel(course: Pick<CourseDto, "code" | "title">): string {
  return `${course.code} – ${course.title}`;
}
