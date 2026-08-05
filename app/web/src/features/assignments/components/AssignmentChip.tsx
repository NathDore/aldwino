import { memo } from "react";
import { getAssignmentColor } from "../utils/assignmentStatus";
import type { CalendarAssignment } from "@/features/calendar/types/calendar.types";

interface AssignmentChipProps {
  item: CalendarAssignment;
  size?: "md" | "sm";
}

const SIZE_CLASSES: Record<"md" | "sm", string> = {
  md: "h-5 w-5 text-[10px]",
  sm: "h-3.5 w-3.5 text-[8px]",
};

export const AssignmentChip = memo(function AssignmentChip({ item, size = "md" }: AssignmentChipProps) {
  const { assignment, course } = item;
  const letter = course?.code?.charAt(0).toUpperCase() ?? "?";
  const backgroundColor = getAssignmentColor(assignment, course);

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-sm border border-slate-400 font-semibold text-white ${SIZE_CLASSES[size]} ${assignment.isCompleted ? "opacity-50 line-through" : ""}`}
      style={{ backgroundColor }}
      title={assignment.description}
    >
      {letter}
    </div>
  );
});
