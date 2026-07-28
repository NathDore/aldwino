import { useEventsQuery } from "@/features/events";
import { useAssignmentsQuery } from "@/features/assignments";
import { useTasksQuery } from "@/features/tasks";
import { useCoursesQuery } from "@/features/courses";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import { useCalendarStore } from "../store/calendarStore";
import { WeekNavigation } from "@/shared/components/WeekNavigation";
import { WeekGrid } from "./WeekGrid";

export function CalendarPage() {
  const { data: events = [] } = useEventsQuery();
  const { data: assignments = [] } = useAssignmentsQuery();
  const { data: tasks = [] } = useTasksQuery();
  const { data: courses = [] } = useCoursesQuery();

  const calendarEvents = useCalendarEvents(events, assignments, courses, tasks);

  const currentWeekStart = useCalendarStore((s) => s.currentWeekStart);
  const goToPrevWeek = useCalendarStore((s) => s.goToPrevWeek);
  const goToNextWeek = useCalendarStore((s) => s.goToNextWeek);

  return (
    <div className="p-8 max-w-full mx-auto">
      <div className="mb-4 sticky top-0 z-40 h-14 flex items-center bg-white border-b border-slate-200">
        <WeekNavigation
          title="Calendar"
          weekStart={currentWeekStart}
          onPrevWeek={goToPrevWeek}
          onNextWeek={goToNextWeek}
        />
      </div>

      <WeekGrid calendarEvents={calendarEvents} />
    </div>
  );
}
