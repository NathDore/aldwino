import type { AssignmentDto } from "../types/assignment.types";

export interface AssignmentDayGroup {
  dayKey: string;
  dayLabel: string;
  fullDayLabel: string;
  assignments: AssignmentDto[];
}

export function useAssignmentDayGroups(assignments: AssignmentDto[]): AssignmentDayGroup[] {
  const groups = new Map<string, AssignmentDto[]>();

  for (const assignment of assignments) {
    const dayKey = new Date(assignment.startTime).toDateString();
    const existing = groups.get(dayKey);
    if (existing) {
      existing.push(assignment);
    } else {
      groups.set(dayKey, [assignment]);
    }
  }

  return Array.from(groups.entries())
    .map(([dayKey, dayAssignments]) => {
      const sorted = [...dayAssignments].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      const referenceDate = new Date(sorted[0].startTime);
      return {
        dayKey,
        dayLabel: referenceDate.toLocaleDateString(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        fullDayLabel: referenceDate.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        assignments: sorted,
      };
    })
    .sort((a, b) => new Date(a.assignments[0].startTime).getTime() - new Date(b.assignments[0].startTime).getTime());
}
