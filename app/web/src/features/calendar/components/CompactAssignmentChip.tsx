import { memo } from "react";
import type { CalendarAssignment } from "../types/calendar.types";

interface CompactAssignmentChipProps {
  item: CalendarAssignment;
  size?: "md" | "sm";
}

const SIZE_CLASSES: Record<"md" | "sm", string> = {
  md: "h-5 w-5 text-[10px]",
  sm: "h-3.5 w-3.5 text-[8px]",
};

export const CompactAssignmentChip = memo(function CompactAssignmentChip({
  item,
  size = "md",
}: CompactAssignmentChipProps) {
  const { assignment, course } = item;
  const letter = course?.code?.charAt(0).toUpperCase() ?? "?";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-sm border border-slate-400 font-semibold text-white ${SIZE_CLASSES[size]} ${assignment.isCompleted ? "opacity-50" : ""
        }`}
      style={{ backgroundColor: course?.color ?? "#cbd5e1" }}
      title={assignment.description}
    >
      {letter}
    </div>
  );
});
