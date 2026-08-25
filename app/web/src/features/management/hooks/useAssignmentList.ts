import { useMemo } from "react";
import type { AssignmentDto } from "@/features/assignments";
import {
  filterAndSortAssignments,
  groupAssignments,
  buildAssignmentList,
  type AssignmentStatusFilterValue,
} from "../utils/assignmentGrouping";

export function useAssignmentList(
  assignments: AssignmentDto[],
  courseFilterIds: Set<string>,
  statusFilter: Set<AssignmentStatusFilterValue>,
): { rows: AssignmentDto[]; isEmpty: boolean } {
  return useMemo(() => {
    const visible = filterAndSortAssignments(assignments, courseFilterIds);
    const groups = groupAssignments(visible);
    const rows = buildAssignmentList(groups, statusFilter);
    return { rows, isEmpty: rows.length === 0 };
  }, [assignments, courseFilterIds, statusFilter]);
}
