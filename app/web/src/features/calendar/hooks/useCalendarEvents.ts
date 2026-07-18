import { useMemo } from "react";
import type { EventDto } from "@/features/events";
import type { AssignmentDto } from "@/features/assignments";
import type { CourseDto } from "@/features/courses";
import type { TaskDto } from "@/features/tasks";
import type { CalendarEvent } from "../types/calendar.types";

export function useCalendarEvents(
  events: EventDto[],
  assignments: AssignmentDto[],
  courses: CourseDto[],
  tasks: TaskDto[]
): CalendarEvent[] {
  return useMemo(() => {
    const courseById = new Map(courses.map((course) => [course.id, course]));

    const tasksByAssignment = new Map<string, TaskDto[]>();
    for (const task of tasks) {
      const list = tasksByAssignment.get(task.assignmentId);
      if (list) {
        list.push(task);
      } else {
        tasksByAssignment.set(task.assignmentId, [task]);
      }
    }

    const assignmentsByEvent = new Map<string, AssignmentDto[]>();
    for (const assignment of assignments) {
      const list = assignmentsByEvent.get(assignment.eventId);
      if (list) {
        list.push(assignment);
      } else {
        assignmentsByEvent.set(assignment.eventId, [assignment]);
      }
    }

    return events.map((event) => ({
      event,
      assignments: (assignmentsByEvent.get(event.id) ?? []).map((assignment) => ({
        assignment,
        course: courseById.get(assignment.courseId),
        tasks: tasksByAssignment.get(assignment.id) ?? [],
      })),
    }));
  }, [events, assignments, courses, tasks]);
}
