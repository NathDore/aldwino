import {
  useWorkSessionsQuery,
  useWorkSessionStatesQuery,
  useAssignmentWorkSessionsQuery,
  useSkippedWorkSessionSync,
} from "@/features/workSessions";
import { useAssignmentsQuery } from "@/features/assignments";
import { useCoursesQuery } from "@/features/courses";
import { useCalendarWorkSessions } from "../hooks/useCalendarWorkSessions";
import { useCalendarStore } from "../store/calendarStore";
import { WeekNavigation } from "@/shared/components/WeekNavigation";
import { WeekGrid } from "./WeekGrid";

export function CalendarPage() {
  const { data: workSessions = [] } = useWorkSessionsQuery();
  const { data: workSessionStates } = useWorkSessionStatesQuery();
  const { data: assignmentLinks = [] } = useAssignmentWorkSessionsQuery();
  const { data: assignments = [] } = useAssignmentsQuery();
  const { data: courses = [] } = useCoursesQuery();

  const calendarWorkSessions = useCalendarWorkSessions(workSessions, assignmentLinks, assignments, courses);

  useSkippedWorkSessionSync(workSessions, workSessionStates);

  const currentWeekStart = useCalendarStore((s) => s.currentWeekStart);
  const goToPrevWeek = useCalendarStore((s) => s.goToPrevWeek);
  const goToNextWeek = useCalendarStore((s) => s.goToNextWeek);
  const goToToday = useCalendarStore((s) => s.goToToday);

  return (
    <div className="h-full flex flex-col pt-4 px-8 pb-8 max-w-[1200px] mx-auto">
      <div className="mb-4 shrink-0 h-8 flex items-center bg-white border-b border-slate-200">
        <WeekNavigation
          weekStart={currentWeekStart}
          onPrevWeek={goToPrevWeek}
          onNextWeek={goToNextWeek}
          onToday={goToToday}
        />
      </div>

      <div className="flex-1 min-h-0">
        <WeekGrid calendarWorkSessions={calendarWorkSessions} />
      </div>
    </div>
  );
}
