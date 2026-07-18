import type { EventDto } from "@/features/events";
import type { AssignmentDto } from "@/features/assignments";
import type { CourseDto } from "@/features/courses";
import type { TaskDto } from "@/features/tasks";

export interface CalendarAssignment {
  assignment: AssignmentDto;
  course: CourseDto | undefined;
  tasks: TaskDto[];
}

export interface CalendarEvent {
  event: EventDto;
  assignments: CalendarAssignment[];
}
