import { useGroupedEvents } from "@/features/events/hooks/useGroupedEvents";
import { AssignmentDto } from "@/features/assignments/types/assignment.types";
import { CourseDto } from "@/features/courses/types/course.types";
import { EventDto } from "@/features/events/types/event.types";
import { TaskDto } from "../types/task.types";
import { TaskAssignmentCard } from "./TaskAssignmentCard";

interface TaskEventListProps {
  events: EventDto[];
  assignments: AssignmentDto[];
  courses: CourseDto[];
  tasks: TaskDto[];
}

export const TaskEventList = ({
  events,
  assignments,
  courses,
  tasks,
}: TaskEventListProps) => {
  const groupedEvents = useGroupedEvents(events);

  const getAssignmentsForEvent = (eventId: string) => {
    return assignments.filter((a) => a.eventId === eventId);
  };

  const getTasksForAssignment = (assignmentId: string) => {
    return tasks.filter((t) => t.assignmentId === assignmentId);
  };

  const getCourseById = (courseId: string) => {
    return courses.find((c) => c.id === courseId);
  };

  const eventsWithAssignments = groupedEvents.map((dayGroup) => ({
    ...dayGroup,
    events: dayGroup.events.filter((event) => getAssignmentsForEvent(event.id).length > 0),
  })).filter((dayGroup) => dayGroup.events.length > 0);

  return (
    <div className="space-y-8">
      {eventsWithAssignments.map((dayGroup) => (
        <div key={dayGroup.dayKey}>
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            {dayGroup.dayLabel}
          </h2>

          <div className="space-y-4">
            {dayGroup.events.map((event) => {
              const eventAssignments = getAssignmentsForEvent(event.id);

              return (
                <div key={event.id}>
                  <p className="mb-3 text-sm text-slate-700 font-semibold">
                    {new Date(event.startTime).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}{" "}
                    –{" "}
                    {new Date(event.endTime).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>

                  <div className="space-y-3">
                    {eventAssignments.map((assignment) => (
                      <TaskAssignmentCard
                        key={assignment.id}
                        assignment={assignment}
                        course={getCourseById(assignment.courseId)}
                        tasks={getTasksForAssignment(assignment.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
