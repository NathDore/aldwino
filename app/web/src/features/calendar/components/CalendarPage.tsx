import type { MouseEvent } from "react";
import { useEventsQuery, useEventStore } from "@/features/events";
import { EventForm } from "@/features/events/components/EventForm";
import { useAssignmentsQuery } from "@/features/assignments";
import { useTasksQuery } from "@/features/tasks";
import { useCoursesQuery } from "@/features/courses";
import { Modal } from "@/shared/components/Modal";
import { useCalendarEvents } from "../hooks/useCalendarEvents";
import { useCalendarStore } from "../store/calendarStore";
import { WeekNavigation } from "./WeekNavigation";
import { WeekGrid } from "./WeekGrid";

export function CalendarPage() {
  const { data: events = [] } = useEventsQuery();
  const { data: assignments = [] } = useAssignmentsQuery();
  const { data: tasks = [] } = useTasksQuery();
  const { data: courses = [] } = useCoursesQuery();
  const { isFormOpen, selectedEventId } = useEventStore();
  const { expandedEventId, collapseEvent } = useCalendarStore();

  const calendarEvents = useCalendarEvents(events, assignments, courses, tasks);
  const eventToEdit = selectedEventId ? events.find((event) => event.id === selectedEventId) ?? null : null;

  const handleRootClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!expandedEventId) return;
    const target = e.target as HTMLElement;
    if (target.closest("[data-event-block-id]")) return;
    collapseEvent();
  };

  return (
    <div className="p-8 max-w-full mx-auto" onClick={handleRootClick}>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Calendar</h1>

      <WeekNavigation />

      <WeekGrid calendarEvents={calendarEvents} />

      {isFormOpen && (
        <Modal>
          <EventForm eventToEdit={eventToEdit} />
        </Modal>
      )}
    </div>
  );
}
