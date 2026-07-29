import type { EventDto } from "@/features/events";
import type { AssignmentDto } from "@/features/assignments";
import type { CourseDto } from "@/features/courses";

export interface CalendarAssignment {
  assignment: AssignmentDto;
  course: CourseDto | undefined;
}

export interface CalendarEvent {
  event: EventDto;
  assignments: CalendarAssignment[];
}
