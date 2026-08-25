import { type AssignmentDto, isAssignmentCompleted, isAssignmentOverdue, isAssignmentCompletedOverdue } from "@/features/assignments";
import type { CourseDto } from "@/features/courses";
import { Button } from "@/shared/components/Button";
import { getAssignmentStatusBadge, formatAssignmentDueDate } from "../utils/assignmentDisplay";
import { useAssignmentActions } from "../hooks/useAssignmentActions";
import { AssignmentRowMenu } from "./AssignmentRowMenu";
import { ASSIGNMENT_ROW_GRID } from "../utils/assignmentRowLayout";

interface AssignmentRowProps {
  assignment: AssignmentDto;
  course: CourseDto | undefined;
  actions: ReturnType<typeof useAssignmentActions>;
  onReschedule: (assignment: AssignmentDto) => void;
  onEdit: (assignment: AssignmentDto) => void;
  onDelete: (assignment: AssignmentDto) => void;
}

export function AssignmentRow({ assignment, course, actions, onReschedule, onEdit, onDelete }: AssignmentRowProps) {
  const status = getAssignmentStatusBadge(assignment);

  return (
    <div className={`${ASSIGNMENT_ROW_GRID} items-center hover:bg-slate-50`}>
      <div className="p-1.5 text-xs font-medium text-slate-900 truncate">{assignment.name}</div>
      <div className="p-1.5 text-xs text-slate-700 min-w-0">
        <span className="inline-flex items-center gap-1.5 min-w-0">
          <span
            className="w-2 h-2 rounded-sm shrink-0"
            style={{ backgroundColor: course?.color ?? "#cbd5e1" }}
            aria-hidden="true"
          />
          <span className="truncate">{course?.code ?? "—"}</span>
        </span>
      </div>
      <div className="p-1.5 text-xs text-slate-600">{formatAssignmentDueDate(assignment.dueDate)}</div>
      <div className="p-1.5">
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${status.className}`}>
          {status.label}
        </span>
      </div>
      <div className="p-1.5">
        <div className="grid grid-cols-[6rem_1.5rem] items-center gap-1.5">
          <div className="flex justify-end">
            {isAssignmentCompletedOverdue(assignment) ? (
              <Button
                variant="success"
                size="xs"
                className="w-full"
                onClick={() => actions.wrapUp(assignment)}
                disabled={actions.isWrapUpPending}
              >
                Wrap up
              </Button>
            ) : isAssignmentCompleted(assignment) ? (
              <Button
                variant="primary"
                size="xs"
                className="w-full"
                onClick={() => actions.uncomplete(assignment)}
                disabled={actions.isUncompletePending}
              >
                Uncomplete
              </Button>
            ) : isAssignmentOverdue(assignment) ? (
              <Button variant="warning" size="xs" className="w-full" onClick={() => onReschedule(assignment)}>
                Reschedule
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="xs"
                className="w-full"
                onClick={() => actions.complete(assignment)}
                disabled={actions.isCompletePending}
              >
                Complete
              </Button>
            )}
          </div>
          <div className="flex justify-end">
            {isAssignmentCompletedOverdue(assignment) ? null : isAssignmentCompleted(assignment) ? (
              <AssignmentRowMenu
                assignmentName={assignment.name}
                items={[{ label: "Wrap up", onClick: () => actions.wrapUp(assignment) }]}
              />
            ) : isAssignmentOverdue(assignment) ? (
              <AssignmentRowMenu
                assignmentName={assignment.name}
                items={[{ label: "Wrap up - late", onClick: () => actions.wrapUpLate(assignment) }]}
              />
            ) : (
              <AssignmentRowMenu
                assignmentName={assignment.name}
                items={[
                  { label: "Edit", onClick: () => onEdit(assignment) },
                  { label: "Delete", onClick: () => onDelete(assignment), variant: "danger" },
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
