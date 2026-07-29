import { useMemo } from "react";
import type { EventDto } from "@/features/events";
import type { AssignmentDto } from "@/features/assignments";
import type { CourseDto } from "@/features/courses";
import type { CalendarEvent } from "../types/calendar.types";

export function useCalendarEvents(
  events: EventDto[],
  assignments: AssignmentDto[],
  courses: CourseDto[]
): CalendarEvent[] {
  return useMemo(() => {
    const courseById = new Map(courses.map((course) => [course.id, course]));

    const assignmentsByEvent = new Map<string, AssignmentDto[]>();
    for (const assignment of assignments) {
      const list = assignmentsByEvent.get(assignment.eventId);
      if (list) {
        list.push(assignment);
      } else {
        assignmentsByEvent.set(assignment.eventId, [assignment]);
      }
    }

    return events
      .filter((event) => (assignmentsByEvent.get(event.id) ?? []).length > 0)
      .map((event) => {
        const eventAssignments = (assignmentsByEvent.get(event.id) ?? [])
          .slice()
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        return {
          event,
          assignments: eventAssignments.map((assignment) => ({
            assignment,
            course: courseById.get(assignment.courseId),
          })),
        };
      });
  }, [events, assignments, courses]);
}
