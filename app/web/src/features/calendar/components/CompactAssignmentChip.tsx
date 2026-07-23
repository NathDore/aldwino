import { memo } from "react";
import type { CalendarAssignment } from "../types/calendar.types";

interface CompactAssignmentChipProps {
  item: CalendarAssignment;
}

export const CompactAssignmentChip = memo(function CompactAssignmentChip({ item }: CompactAssignmentChipProps) {
  const { assignment, course } = item;
  const letter = course?.code?.charAt(0).toUpperCase() ?? "?";

  return (
    <div
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-slate-400 text-[10px] font-semibold text-white ${assignment.isCompleted ? "opacity-50" : ""
        }`}
      style={{ backgroundColor: course?.color ?? "#cbd5e1" }}
      title={assignment.description}
    >
      {letter}
    </div>
  );
});
