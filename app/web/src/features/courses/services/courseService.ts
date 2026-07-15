import { apiClient } from "@/shared/lib/apiClient";
import type { CourseDto, CourseFormData, CourseColor } from "../types/course.types";

export async function fetchCourses(): Promise<CourseDto[]> {
  return apiClient<CourseDto[]>("/courses");
}

export async function getCourseById(id: string): Promise<CourseDto> {
  return apiClient<CourseDto>(`/courses/${id}`);
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

export async function updateCourse(id: string, data: CourseFormData): Promise<CourseDto> {
  return apiClient<CourseDto>(`/courses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteCourse(id: string): Promise<void> {
  await apiClient<void>(`/courses/${id}`, { method: "DELETE" });
}
