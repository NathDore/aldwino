import { useMemo } from "react";
import { useWorkSessionAssignmentLinksQuery } from "../queries/useAssignmentWorkSessionsQuery";
import { useUnlinkAssignmentMutation } from "../queries/useAssignmentWorkSessionMutations";
import { useAssignmentsQuery, isAssignmentCompleted, isAssignmentOverdue } from "@/features/assignments";
import { useCoursesQuery } from "@/features/courses";
import { AssignmentPopoverItem } from "@/features/assignments/components/AssignmentPopoverItem";
import type { CalendarAssignment } from "@/features/calendar/types/calendar.types";

interface LinkedAssignmentsListProps {
  workSessionId: string;
  isLocked?: boolean;
}

function byDueDateAsc(
  a: { item: CalendarAssignment },
  b: { item: CalendarAssignment },
): number {
  return new Date(a.item.assignment.dueDate).getTime() - new Date(b.item.assignment.dueDate).getTime();
}

export function LinkedAssignmentsList({ workSessionId, isLocked = false }: LinkedAssignmentsListProps) {
  const { data: links = [] } = useWorkSessionAssignmentLinksQuery(workSessionId);
  const { data: assignments = [] } = useAssignmentsQuery();
  const { data: courses = [] } = useCoursesQuery();
  const unlinkMutation = useUnlinkAssignmentMutation();

  const assignmentById = useMemo(() => new Map(assignments.map((a) => [a.id, a])), [assignments]);
  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  const entries = links
    .map((link) => {
      const assignment = assignmentById.get(link.assignmentId);
      if (!assignment) return null;
      const item: CalendarAssignment = { assignment, course: courseById.get(assignment.courseId) };
      return { link, item };
    })
    .filter((entry): entry is { link: (typeof links)[number]; item: CalendarAssignment } => entry !== null);

  // Grouped by state, uncompleted first, then completed, then overdue at the bottom.
  const uncompletedEntries = entries
    .filter((e) => !isAssignmentCompleted(e.item.assignment) && !isAssignmentOverdue(e.item.assignment))
    .sort(byDueDateAsc);
  const completedEntries = entries.filter((e) => isAssignmentCompleted(e.item.assignment)).sort(byDueDateAsc);
  const overdueEntries = entries.filter((e) => isAssignmentOverdue(e.item.assignment)).sort(byDueDateAsc);

  const items = [uncompletedEntries, completedEntries, overdueEntries]
    .filter((group) => group.length > 0)
    .flatMap((group) => group.map((entry, index) => ({ ...entry, isGroupStart: index === 0 })));

  if (items.length === 0) {
    return <p className="text-xs text-slate-500">No assignments linked to this session.</p>;
  }

  return (
    <div className="space-y-3">
      {isLocked && <p className="text-xs text-slate-500">Reopen this session to change linked assignments.</p>}
      {items.map(({ link, item, isGroupStart }, rowIndex) => (
        <div
          key={link.id}
          className={isGroupStart && rowIndex !== 0 ? "pt-3 border-t-2 border-t-slate-300" : undefined}
        >
          <AssignmentPopoverItem
            item={item}
            onUnlink={() => unlinkMutation.mutate(link.id)}
            isUnlinking={unlinkMutation.isPending && unlinkMutation.variables === link.id}
            unlinkDisabled={isLocked}
          />
        </div>
      ))}
    </div>
  );
}
