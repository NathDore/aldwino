import { useMemo } from "react";
import { useWorkSessionAssignmentLinksQuery } from "../queries/useAssignmentWorkSessionsQuery";
import { useUnlinkAssignmentMutation } from "../queries/useAssignmentWorkSessionMutations";
import { useAssignmentsQuery, isAssignmentCompleted } from "@/features/assignments";
import { useCoursesQuery } from "@/features/courses";
import { AssignmentPopoverItem } from "@/features/assignments/components/AssignmentPopoverItem";
import type { CalendarAssignment } from "@/features/calendar/types/calendar.types";

interface LinkedAssignmentsListProps {
  workSessionId: string;
}

export function LinkedAssignmentsList({ workSessionId }: LinkedAssignmentsListProps) {
  const { data: links = [] } = useWorkSessionAssignmentLinksQuery(workSessionId);
  const { data: assignments = [] } = useAssignmentsQuery();
  const { data: courses = [] } = useCoursesQuery();
  const unlinkMutation = useUnlinkAssignmentMutation();

  const assignmentById = useMemo(() => new Map(assignments.map((a) => [a.id, a])), [assignments]);
  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  const items = links
    .map((link) => {
      const assignment = assignmentById.get(link.assignmentId);
      if (!assignment) return null;
      const item: CalendarAssignment = { assignment, course: courseById.get(assignment.courseId) };
      return { link, item };
    })
    .filter((entry): entry is { link: (typeof links)[number]; item: CalendarAssignment } => entry !== null)
    .sort((a, b) => Number(isAssignmentCompleted(a.item.assignment)) - Number(isAssignmentCompleted(b.item.assignment)));

  if (items.length === 0) {
    return <p className="text-xs text-slate-500">No assignments linked to this session.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map(({ link, item }) => (
        <AssignmentPopoverItem
          key={link.id}
          item={item}
          onUnlink={() => unlinkMutation.mutate(link.id)}
          isUnlinking={unlinkMutation.isPending && unlinkMutation.variables === link.id}
        />
      ))}
    </div>
  );
}
