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

    const linksByWorkSession = new Map<string, AssignmentWorkSessionDto[]>();
    for (const link of assignmentLinks) {
      const list = linksByWorkSession.get(link.workSessionId);
      if (list) {
        list.push(link);
      } else {
        linksByWorkSession.set(link.workSessionId, [link]);
      }
    }

    const uniqueWorkSessions = Array.from(new Map(workSessions.map((ws) => [ws.id, ws])).values());

    return uniqueWorkSessions.map((workSession) => {
      const linkedEntries = (linksByWorkSession.get(workSession.id) ?? [])
        .map((link) => {
          const assignment = assignmentById.get(link.assignmentId);
          return assignment ? { assignment, workedOn: link.workedOn } : undefined;
        })
        .filter((entry): entry is { assignment: AssignmentDto; workedOn: boolean } => entry !== undefined)
        .sort((a, b) => new Date(a.assignment.dueDate).getTime() - new Date(b.assignment.dueDate).getTime());

      return {
        workSession,
        assignments: linkedEntries.map(({ assignment, workedOn }) => ({
          assignment,
          course: courseById.get(assignment.courseId),
          workedOn,
        })),
      };
    });
  }, [workSessions, assignmentLinks, assignments, courses]);
}
