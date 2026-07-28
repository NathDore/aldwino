import { memo } from "react";
import type { CalendarAssignment } from "../types/calendar.types";

interface CompactSingleAssignmentProps {
  item: CalendarAssignment;
}

export const CompactSingleAssignment = memo(function CompactSingleAssignment({
  item,
}: CompactSingleAssignmentProps) {
  const { assignment, course } = item;

  return (
    <div
      className="flex h-full w-full min-w-0 items-center border-l-2 pl-1.5"
      style={{ borderLeftColor: course?.color ?? "#cbd5e1" }}
    >
      <p
        className={`truncate text-xs leading-none ${
          assignment.isCompleted ? "line-through text-slate-500" : "text-slate-900"
        }`}
        title={assignment.description}
      >
        {assignment.description}
      </p>
    </div>
  );
});
