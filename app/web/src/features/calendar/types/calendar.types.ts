import type { WorkSessionDto } from "@/features/workSessions";
import type { AssignmentDto } from "@/features/assignments";
import type { CourseDto } from "@/features/courses";

export interface CalendarAssignment {
  assignment: AssignmentDto;
  course: CourseDto | undefined;
}

export interface CalendarWorkSession {
  workSession: WorkSessionDto;
  assignments: CalendarAssignment[];
}
