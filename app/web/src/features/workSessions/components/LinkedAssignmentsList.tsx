import { useMemo } from "react";
import { useWorkSessionAssignmentLinksQuery } from "../queries/useAssignmentWorkSessionsQuery";
import {
  useUnlinkAssignmentMutation,
  useMarkWorkedOnMutation,
  useUnmarkWorkedOnMutation,
} from "../queries/useAssignmentWorkSessionMutations";
import { useAssignmentsQuery, getCourseColor } from "@/features/assignments";
import { useCoursesQuery, formatCourseLabel } from "@/features/courses";
import { CheckIcon, UnlinkIcon } from "@/features/calendar/components/icons";
import type { AssignmentWorkSessionDto } from "../types/assignmentWorkSession.types";
import type { AssignmentDto } from "@/features/assignments";
import type { CourseDto } from "@/features/courses";

interface LinkedAssignmentsListProps {
  workSessionId: string;
  canEdit: boolean;
}

interface Entry {
  link: AssignmentWorkSessionDto;
  assignment: AssignmentDto;
  course: CourseDto | undefined;
}

export function LinkedAssignmentsList({ workSessionId, canEdit }: LinkedAssignmentsListProps) {
  const { data: links = [] } = useWorkSessionAssignmentLinksQuery(workSessionId);
  const { data: assignments = [] } = useAssignmentsQuery();
  const { data: courses = [] } = useCoursesQuery();
  const unlinkMutation = useUnlinkAssignmentMutation();
  const markWorkedOnMutation = useMarkWorkedOnMutation();
  const unmarkWorkedOnMutation = useUnmarkWorkedOnMutation();

  const assignmentById = useMemo(() => new Map(assignments.map((a) => [a.id, a])), [assignments]);
  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  const entries: Entry[] = links
    .map((link) => {
      const assignment = assignmentById.get(link.assignmentId);
      if (!assignment) return null;
      return { link, assignment, course: courseById.get(assignment.courseId) };
    })
    .filter((entry): entry is Entry => entry !== null)
    .sort((a, b) => new Date(a.assignment.dueDate).getTime() - new Date(b.assignment.dueDate).getTime());

  if (entries.length === 0) {
    return <p className="text-xs text-slate-500">No assignments linked to this session.</p>;
  }

  return (
    <div className="flex flex-col">
      {entries.map(({ link, assignment, course }) => {
        const checked = link.workedOn;
        const isTogglePending =
          (markWorkedOnMutation.isPending && markWorkedOnMutation.variables === link.id) ||
          (unmarkWorkedOnMutation.isPending && unmarkWorkedOnMutation.variables === link.id);
        const courseColor = getCourseColor(course);

        return (
          <div key={link.id} className="flex items-center gap-2.5 py-2 border-b border-slate-100 last:border-b-0">
            <button
              type="button"
              onClick={() => {
                if (!canEdit || isTogglePending) return;
                if (checked) {
                  unmarkWorkedOnMutation.mutate(link.id);
                } else {
                  markWorkedOnMutation.mutate(link.id);
                }
              }}
              disabled={!canEdit || isTogglePending}
              title="Worked on this assignment during this session"
              className="w-5 h-5 shrink-0 rounded-md flex items-center justify-center border-2 disabled:cursor-default disabled:opacity-50"
              style={{
                borderColor: checked ? courseColor : "#cbd5e1",
                backgroundColor: checked ? courseColor : "#ffffff",
              }}
            >
              {checked && <CheckIcon className="w-2.5 h-2.5 text-white" />}
            </button>
            <div className="min-w-0 flex-1 flex items-baseline gap-1.5 overflow-hidden">
              <span className="text-xs font-bold text-slate-600 shrink-0">
                {course ? formatCourseLabel(course) : "Unknown course"}
              </span>
              <span className="text-xs font-bold text-slate-600 shrink-0">·</span>
              <span className="text-sm text-slate-900 truncate">{assignment.name}</span>
            </div>
            {canEdit && (
              <button
                type="button"
                aria-label={`Unlink ${assignment.name}`}
                onClick={() => unlinkMutation.mutate(link.id)}
                disabled={unlinkMutation.isPending && unlinkMutation.variables === link.id}
                className="w-[26px] h-[26px] shrink-0 rounded-md flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <UnlinkIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
