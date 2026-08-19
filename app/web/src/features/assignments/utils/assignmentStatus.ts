import type { AssignmentDto } from "../types/assignment.types";
import type { AssignmentStateDto, AssignmentStateName } from "../types/assignmentState.types";
import type { CourseDto } from "@/features/courses";

const DEFAULT_COLOR = "#cbd5e1";

export function isAssignmentCompleted(assignment: AssignmentDto): boolean {
  return assignment.completedAt !== null;
}

export function isAssignmentOverdue(assignment: AssignmentDto): boolean {
  return !isAssignmentCompleted(assignment) && new Date(assignment.dueDate) < new Date();
}

export function getCourseColor(course: CourseDto | undefined): string {
  return course?.color ?? DEFAULT_COLOR;
}

export function getAssignmentStatusBackgroundClass(assignment: AssignmentDto): string {
  if (isAssignmentOverdue(assignment)) return "bg-red-50";
  if (isAssignmentCompleted(assignment)) return "bg-green-50";
  return "";
}

export function getAssignmentStatusRingClass(assignment: AssignmentDto): string {
  if (isAssignmentOverdue(assignment)) return "ring-2 ring-red-400";
  if (isAssignmentCompleted(assignment)) return "ring-2 ring-green-400";
  return "";
}

export function getAssignmentStateId(
  states: AssignmentStateDto[] | undefined,
  name: AssignmentStateName
): string | undefined {
  return states?.find((state) => state.state === name)?.id;
}
