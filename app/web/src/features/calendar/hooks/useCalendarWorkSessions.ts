import { useMemo } from "react";
import type { WorkSessionDto, AssignmentWorkSessionDto } from "@/features/workSessions";
import type { AssignmentDto } from "@/features/assignments";
import type { CourseDto } from "@/features/courses";
import type { CalendarWorkSession } from "../types/calendar.types";

export function useCalendarWorkSessions(
  workSessions: WorkSessionDto[],
  assignmentLinks: AssignmentWorkSessionDto[],
  assignments: AssignmentDto[],
  courses: CourseDto[]
): CalendarWorkSession[] {
  return useMemo(() => {
    const courseById = new Map(courses.map((course) => [course.id, course]));
    const assignmentById = new Map(assignments.map((assignment) => [assignment.id, assignment]));

    const assignmentIdsByWorkSession = new Map<string, string[]>();
    for (const link of assignmentLinks) {
      const list = assignmentIdsByWorkSession.get(link.workSessionId);
      if (list) {
        list.push(link.assignmentId);
      } else {
        assignmentIdsByWorkSession.set(link.workSessionId, [link.assignmentId]);
      }
    }

    const uniqueWorkSessions = Array.from(new Map(workSessions.map((ws) => [ws.id, ws])).values());

    return uniqueWorkSessions.map((workSession) => {
      const linkedAssignments = (assignmentIdsByWorkSession.get(workSession.id) ?? [])
        .map((assignmentId) => assignmentById.get(assignmentId))
        .filter((assignment): assignment is AssignmentDto => assignment !== undefined)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

      return {
        workSession,
        assignments: linkedAssignments.map((assignment) => ({
          assignment,
          course: courseById.get(assignment.courseId),
        })),
      };
    });
  }, [workSessions, assignmentLinks, assignments, courses]);
}
