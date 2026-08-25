import { useMemo } from "react";
import type { AssignmentDto } from "@/features/assignments";
import { filterAndSortAssignments, groupAssignments, type AssignmentGroups } from "../utils/assignmentGrouping";

export function useAssignmentGroups(
  assignments: AssignmentDto[],
  courseFilterIds: Set<string>,
): AssignmentGroups & { isEmpty: boolean } {
  return useMemo(() => {
    const visible = filterAndSortAssignments(assignments, courseFilterIds);
    const groups = groupAssignments(visible);
    return { ...groups, isEmpty: visible.length === 0 };
  }, [assignments, courseFilterIds]);
}
