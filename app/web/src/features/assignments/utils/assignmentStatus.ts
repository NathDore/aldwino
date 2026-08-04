import type { AssignmentDto } from "../types/assignment.types";
import type { CourseDto } from "@/features/courses";

const COMPLETED_COLOR = "#10b981";
const OVERDUE_COLOR = "#f59e0b";
const DEFAULT_COLOR = "#cbd5e1";

export function isAssignmentOverdue(assignment: AssignmentDto): boolean {
  return !assignment.isCompleted && new Date(assignment.dueDate) < new Date();
}

export function getAssignmentColor(assignment: AssignmentDto, course: CourseDto | undefined): string {
  if (assignment.isCompleted) return COMPLETED_COLOR;
  if (isAssignmentOverdue(assignment)) return OVERDUE_COLOR;
  return course?.color ?? DEFAULT_COLOR;
}
