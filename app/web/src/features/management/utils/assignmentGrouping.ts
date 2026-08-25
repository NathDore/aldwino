import { type AssignmentDto, isAssignmentCompleted, isAssignmentOverdue } from "@/features/assignments";

export interface AssignmentGroups {
  overdue: AssignmentDto[];
  uncompleted: AssignmentDto[];
  completed: AssignmentDto[];
}

export type AssignmentStatusFilterValue = "overdue" | "uncompleted" | "completed";

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

export function buildAssignmentList(
  groups: AssignmentGroups,
  statusFilter: Set<AssignmentStatusFilterValue>,
): AssignmentDto[] {
  const includeAll = statusFilter.size === 0;
  return [
    ...(includeAll || statusFilter.has("overdue") ? groups.overdue : []),
    ...(includeAll || statusFilter.has("uncompleted") ? groups.uncompleted : []),
    ...(includeAll || statusFilter.has("completed") ? groups.completed : []),
  ];
}
