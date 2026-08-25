import { type AssignmentDto, isAssignmentCompleted, isAssignmentOverdue } from "@/features/assignments";

export interface AssignmentGroups {
  overdue: AssignmentDto[];
  uncompleted: AssignmentDto[];
  completed: AssignmentDto[];
}

export function filterAndSortAssignments(
  assignments: AssignmentDto[],
  courseFilterIds: Set<string>,
): AssignmentDto[] {
  return (courseFilterIds.size === 0 ? assignments : assignments.filter((a) => courseFilterIds.has(a.courseId)))
    .slice()
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export function groupAssignments(assignments: AssignmentDto[]): AssignmentGroups {
  return {
    overdue: assignments.filter((a) => isAssignmentOverdue(a)),
    uncompleted: assignments.filter((a) => !isAssignmentCompleted(a) && !isAssignmentOverdue(a)),
    completed: assignments.filter((a) => isAssignmentCompleted(a)),
  };
}
