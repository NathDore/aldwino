import { memo } from "react";
import { useCompleteAssignmentMutation } from "@/features/assignments/queries/useMutations";
import type { CalendarAssignment } from "../types/calendar.types";

interface AssignmentPopoverItemProps {
  item: CalendarAssignment;
}

function formatDueDate(dueDate: string): string {
  return new Date(dueDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const AssignmentPopoverItem = memo(function AssignmentPopoverItem({ item }: AssignmentPopoverItemProps) {
  const { assignment, course } = item;
  const mutation = useCompleteAssignmentMutation();
  const borderColor = assignment.isCompleted ? "#10b981" : (course?.color ?? "#cbd5e1");

  const handleToggleComplete = async () => {
    await mutation.mutateAsync({
      id: assignment.id,
      isCompleted: !assignment.isCompleted,
    });
  };

  return (
    <div
      className={`border border-slate-200 rounded-md p-3 ${assignment.isCompleted ? "opacity-50" : ""}`}
      style={{ borderLeftColor: borderColor }}
    >
      <div className="flex items-start gap-2">
        <div
          className="w-3.5 h-3.5 mt-0.5 shrink-0 rounded-sm border border-slate-400"
          style={{ backgroundColor: borderColor }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold text-slate-700 truncate ${assignment.isCompleted ? "line-through" : ""}`}>
            {course ? `${course.code} - ${course.title}` : "Unknown course"}
          </p>
          <p className={`text-base mt-0.5 whitespace-normal break-words text-slate-900 ${assignment.isCompleted ? "line-through" : ""}`}>
            {assignment.description}
          </p>
          {!assignment.isCompleted && (
            <p className="text-xs text-slate-600 mt-1.5">
              {assignment.expectedDurationMinutes} min • Due {formatDueDate(assignment.dueDate)}
            </p>
          )}
        </div>
        <input
          type="checkbox"
          checked={assignment.isCompleted}
          onChange={handleToggleComplete}
          disabled={mutation.isPending}
          className="mt-1 cursor-pointer shrink-0"
          aria-label={`Mark ${assignment.description} as ${assignment.isCompleted ? "incomplete" : "complete"}`}
        />
      </div>
    </div>
  );
});
