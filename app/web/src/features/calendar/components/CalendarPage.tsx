import { useEventsQuery } from "@/features/events";
import { useAssignmentsQuery } from "@/features/assignments";
import { useCoursesQuery } from "@/features/courses";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import { useCalendarStore } from "../store/calendarStore";
import { WeekNavigation } from "@/shared/components/WeekNavigation";
import { WeekGrid } from "./WeekGrid";

export function CalendarPage() {
  const { data: events = [] } = useEventsQuery();
  const { data: assignments = [] } = useAssignmentsQuery();
  const { data: courses = [] } = useCoursesQuery();

  const calendarEvents = useCalendarEvents(events, assignments, courses);

  const currentWeekStart = useCalendarStore((s) => s.currentWeekStart);
  const goToPrevWeek = useCalendarStore((s) => s.goToPrevWeek);
  const goToNextWeek = useCalendarStore((s) => s.goToNextWeek);

  return (
    <div className="h-screen flex flex-col p-8 max-w-[1200px] mx-auto">
      <div className="mb-4 shrink-0 h-14 flex items-center bg-white border-b border-slate-200">
        <WeekNavigation
          title="Calendar"
          weekStart={currentWeekStart}
          onPrevWeek={goToPrevWeek}
          onNextWeek={goToNextWeek}
        />
      </div>

      <div className="flex-1 min-h-0">
        <WeekGrid calendarEvents={calendarEvents} />
      </div>
    </div>
  );
}
