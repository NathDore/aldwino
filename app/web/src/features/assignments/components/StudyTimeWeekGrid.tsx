import { useEffect, useMemo, useState } from "react";
import type { AssignmentDto } from "../types/assignment.types";
import type { CourseDto } from "@/features/courses";
import { useAssignmentStore } from "../store/assignmentStore";
import { StudyDayCell } from "./StudyDayCell";
import { Button } from "@/shared/components/Button";
import { getWeekStart, parseISODate, toISODate, useWeekDays } from "@/features/calendar/hooks/useWeekDays";

interface StudyTimeWeekGridProps {
  assignments: AssignmentDto[];
  courses: CourseDto[];
}

function shiftWeek(weekStartIso: string, days: number): string {
  const d = parseISODate(weekStartIso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

function formatWeekRange(start: Date, end: Date): string {
  const startLabel = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

export function StudyTimeWeekGrid({ assignments, courses }: StudyTimeWeekGridProps) {
  const [weekStart, setWeekStart] = useState(() => toISODate(getWeekStart(new Date())));
  const days = useWeekDays(weekStart);
  const selectStudyDate = useAssignmentStore((s) => s.selectStudyDate);
  const selectedStudyDate = useAssignmentStore((s) => s.selectedStudyDate);

  useEffect(() => {
    selectStudyDate(toISODate(new Date()));
  }, [selectStudyDate]);

  const coursesById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);

  const assignmentsByDay = useMemo(() => {
    const map = new Map<string, AssignmentDto[]>();
    for (const assignment of assignments) {
      const iso = toISODate(new Date(assignment.startTime));
      const existing = map.get(iso);
      if (existing) {
        existing.push(assignment);
      } else {
        map.set(iso, [assignment]);
      }
    }
    return map;
  }, [assignments]);

  const today = toISODate(new Date());

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-slate-900">Study Time</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setWeekStart((w) => shiftWeek(w, -7))}>
            Previous
          </Button>
          <span className="text-sm text-slate-600 min-w-[100px] text-center">
            {formatWeekRange(days[0], days[6])}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setWeekStart((w) => shiftWeek(w, 7))}>
            Next
          </Button>
        </div>
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
              dayAssignments={assignmentsByDay.get(iso) ?? []}
              coursesById={coursesById}
              onSelect={selectStudyDate}
            />
          );
        })}
      </div>
    </div>
  );
}
