import { apiClient } from "@/shared/lib/apiClient";
import type { CourseDto, CourseFormData, CourseColor } from "../types/course.types";

export async function fetchCourses(): Promise<CourseDto[]> {
  return apiClient<CourseDto[]>("/courses");
}

export async function fetchAllowedColors(): Promise<CourseColor[]> {
  return apiClient<CourseColor[]>("/courses/colors");
}

export async function createCourse(data: CourseFormData): Promise<CourseDto> {
  return apiClient<CourseDto>("/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
