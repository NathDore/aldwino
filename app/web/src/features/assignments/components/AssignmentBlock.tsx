import { memo } from "react";
import { AssignmentChip } from "./AssignmentChip";
import { getAssignmentColor, isAssignmentCompleted } from "../utils/assignmentStatus";
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

  const borderColor = getAssignmentColor(assignment, course);
  const completed = isAssignmentCompleted(assignment);

  return (
    <div
      className={`min-w-0 border-l-2 pl-1.5 py-0.5 ${completed ? "opacity-50" : ""}`}
      style={{ borderLeftColor: borderColor }}
    >
      <p
        className={`text-xs truncate text-slate-900 ${completed ? "line-through" : ""}`}
        title={assignment.name}
      >
        {assignment.name}
      </p>
    </div>
  );
});
