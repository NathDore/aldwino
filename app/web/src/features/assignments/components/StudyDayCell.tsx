import { memo, useRef } from "react";
import type { AssignmentDto } from "../types/assignment.types";
import type { CourseDto } from "@/features/courses";
import { AssignmentChip } from "@/features/calendar/components/AssignmentChip";
import { useFittingChips } from "@/features/calendar/hooks/useFittingChips";

const CHIP_SIZE_PX = 14;
const CHIP_GAP_PX = 4;
const INDICATOR_WIDTH_PX = 16;

interface StudyDayCellProps {
  iso: string;
  day: Date;
  isToday: boolean;
  isSelected: boolean;
  dayAssignments: AssignmentDto[];
  coursesById: Map<string, CourseDto>;
  onSelect: (iso: string) => void;
}

export const StudyDayCell = memo(function StudyDayCell({
  iso,
  day,
  isToday,
  isSelected,
  dayAssignments,
  coursesById,
  onSelect,
}: StudyDayCellProps) {
  const chipRowRef = useRef<HTMLDivElement>(null);
  const { visibleCount } = useFittingChips(chipRowRef, dayAssignments.length, {
    chipSizePx: CHIP_SIZE_PX,
    gapPx: CHIP_GAP_PX,
    indicatorWidthPx: INDICATOR_WIDTH_PX,
  });
  const hiddenAssignments = dayAssignments.slice(visibleCount);

  return (
    <button
      onClick={() => onSelect(iso)}
      className={`relative flex flex-col items-center rounded border p-1.5 text-center transition-colors ${
        isSelected
          ? "bg-emerald-600 border-emerald-600 hover:bg-emerald-700"
          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
      }`}
    >
      <p className={`text-[10px] leading-tight ${isSelected ? "text-emerald-50" : "text-slate-600"}`}>
        {day.toLocaleDateString(undefined, { weekday: "short" })}
      </p>
      <p
        className={`text-sm font-semibold leading-tight ${
          isSelected ? "text-white" : isToday ? "text-emerald-600" : "text-slate-900"
        }`}
      >
        {day.getDate()}
      </p>
      <div ref={chipRowRef} className="mt-1 flex min-h-[14px] w-full items-center justify-center gap-1 overflow-hidden">
        {dayAssignments.slice(0, visibleCount).map((assignment) => (
          <AssignmentChip
            key={assignment.id}
            item={{ assignment, course: coursesById.get(assignment.courseId) }}
            size="sm"
          />
        ))}
        {hiddenAssignments.length > 0 && (
          <span
            className="inline-flex h-3.5 min-w-3.5 shrink-0 items-center justify-center rounded-full bg-slate-200 px-1 text-[8px] font-medium text-slate-700"
            title={hiddenAssignments.map((a) => a.description).join("\n")}
          >
            +{hiddenAssignments.length}
          </span>
        )}
      </div>
    </button>
  );
});
