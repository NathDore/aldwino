import { memo } from "react";
import { AssignmentChip } from "./AssignmentChip";
import type { CalendarAssignment } from "../types/calendar.types";

interface AssignmentBlockProps {
  item: CalendarAssignment;
  state?: "compact" | "default";
}

export const AssignmentBlock = memo(function AssignmentBlock({ item, state = "default" }: AssignmentBlockProps) {
  const { assignment, course } = item;

  if (state === "compact") {
    return <AssignmentChip item={item} />;
  }

  return (
    <div className="border-l-2 pl-1.5 py-0.5" style={{ borderLeftColor: course?.color ?? "#cbd5e1" }}>
      <p className="text-xs truncate text-slate-900" title={assignment.description}>
        {assignment.description}
      </p>
    </div>
  );
});
