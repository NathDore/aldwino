import { useEffect, useMemo, useState } from "react";
import type { AssignmentDto } from "../types/assignment.types";
import type { CourseDto } from "@/features/courses";
import { useAssignmentStore } from "../store/assignmentStore";
import { StudyDayCell } from "./StudyDayCell";
import { WeekNavigation } from "@/shared/components/WeekNavigation";
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
