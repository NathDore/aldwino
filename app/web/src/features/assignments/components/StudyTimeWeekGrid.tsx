import { useEffect, useState } from "react";
import { useAssignmentStore } from "../store/assignmentStore";
import { StudyDayCell } from "./StudyDayCell";
import { WeekNavigation } from "@/shared/components/WeekNavigation";
import { getWeekStart, parseISODate, toISODate, useWeekDays } from "@/features/calendar/hooks/useWeekDays";

function shiftWeek(weekStartIso: string, days: number): string {
  const d = parseISODate(weekStartIso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function StudyTimeWeekGrid() {
  const [weekStart, setWeekStart] = useState(() => toISODate(getWeekStart(new Date())));
  const days = useWeekDays(weekStart);
  const selectStudyDate = useAssignmentStore((s) => s.selectStudyDate);
  const selectedStudyDate = useAssignmentStore((s) => s.selectedStudyDate);

  useEffect(() => {
    selectStudyDate(toISODate(new Date()));
  }, [selectStudyDate]);

  const today = toISODate(new Date());

  return (
    <div>
      <div className="mb-2">
        <WeekNavigation
          title="Assignments"
          weekStart={weekStart}
          onPrevWeek={() => setWeekStart((w) => shiftWeek(w, -7))}
          onNextWeek={() => setWeekStart((w) => shiftWeek(w, 7))}
        />
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const iso = toISODate(day);
          return (
            <StudyDayCell
              key={iso}
              iso={iso}
              day={day}
              isToday={iso === today}
              isSelected={iso === selectedStudyDate}
              onSelect={selectStudyDate}
            />
          );
        })}
      </div>
    </div>
  );
}
