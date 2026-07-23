import { useEventsQuery } from "@/features/events";
import { useAssignmentsQuery } from "@/features/assignments";
import { useTasksQuery } from "@/features/tasks";
import { useCoursesQuery } from "@/features/courses";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import { WeekNavigation } from "./WeekNavigation";
import { WeekGrid } from "./WeekGrid";

export function CalendarPage() {
  const { data: events = [] } = useEventsQuery();
  const { data: assignments = [] } = useAssignmentsQuery();
  const { data: tasks = [] } = useTasksQuery();
  const { data: courses = [] } = useCoursesQuery();

  const calendarEvents = useCalendarEvents(events, assignments, courses, tasks);

  return (
    <div className="p-8 max-w-full mx-auto">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Calendar</h1>

      <WeekNavigation />

      <WeekGrid calendarEvents={calendarEvents} />
    </div>
  );
}
