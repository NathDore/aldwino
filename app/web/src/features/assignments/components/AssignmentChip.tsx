import { memo } from "react";
import { getCourseColor } from "../utils/assignmentStatus";
import { CheckIcon } from "@/features/calendar/components/icons";
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
  const backgroundColor = getCourseColor(course);
  const isCompleted = assignment.completedAt !== null;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-sm border border-slate-400 font-semibold text-white ${SIZE_CLASSES[size]} ${item.workedOn ? "opacity-50" : ""}`}
      style={{ backgroundColor }}
      title={isCompleted ? `${assignment.name} (Done)` : assignment.name}
    >
      {letter}
      {isCompleted && (
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-600 text-white ring-1 ring-white">
          <CheckIcon className="w-1.5 h-1.5" />
        </span>
      )}
    </div>
  );
});
