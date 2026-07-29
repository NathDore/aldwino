import { memo } from "react";
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

  return (
    <div className="border border-slate-200 rounded-md p-3">
      <div className="flex items-start gap-2">
        <div
          className="w-3.5 h-3.5 mt-0.5 shrink-0 rounded-sm border border-slate-400"
          style={{ backgroundColor: course?.color ?? "#cbd5e1" }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-700 truncate">
            {course ? `${course.code} - ${course.title}` : "Unknown course"}
          </p>
          <p className="text-base mt-0.5 whitespace-normal break-words text-slate-900">{assignment.description}</p>
          <p className="text-xs text-slate-600 mt-1.5">
            {assignment.expectedDurationMinutes} min • Due {formatDueDate(assignment.dueDate)}
          </p>
        </div>
      </div>
    </div>
  );
});
