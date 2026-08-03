import { memo } from "react";
import { AssignmentChip } from "./AssignmentChip";
import type { CalendarAssignment } from "@/features/calendar/types/calendar.types";

interface AssignmentBlockProps {
  item: CalendarAssignment;
  state?: "compact" | "default";
}

export const AssignmentBlock = memo(function AssignmentBlock({ item, state = "default" }: AssignmentBlockProps) {
  const { assignment, course } = item;

  if (state === "compact") {
    return <AssignmentChip item={item} />;
  }

  const borderColor = assignment.isCompleted ? "#10b981" : (course?.color ?? "#cbd5e1");

  return (
    <div
      className={`min-w-0 border-l-2 pl-1.5 py-0.5 ${assignment.isCompleted ? "opacity-50" : ""}`}
      style={{ borderLeftColor: borderColor }}
    >
      <p
        className={`text-xs truncate text-slate-900 ${assignment.isCompleted ? "line-through" : ""}`}
        title={assignment.description}
      >
        {assignment.description}
      </p>
    </div>
  );
});
