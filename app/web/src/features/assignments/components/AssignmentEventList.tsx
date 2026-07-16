import type { AssignmentDto } from "../types/assignment.types";
import type { CourseDto } from "@/features/courses";
import type { EventDto } from "@/features/events";
import { useGroupedEvents } from "@/features/events";
import { AssignmentChip } from "./AssignmentChip";

interface AssignmentEventListProps {
  events: EventDto[];
  assignments: AssignmentDto[];
  courses: CourseDto[];
  isLoading: boolean;
  onDeleteAssignment: (id: string) => void;
}

function formatTimeRange(startTime: string, endTime: string): string {
  const timeFormat: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  const start = new Date(startTime).toLocaleTimeString(undefined, timeFormat);
  const end = new Date(endTime).toLocaleTimeString(undefined, timeFormat);
  return `${start} – ${end}`;
}

export function AssignmentEventList({
  events,
  assignments,
  courses,
  isLoading,
  onDeleteAssignment,
}: AssignmentEventListProps) {
  const dayGroups = useGroupedEvents(events);
  const coursesById = new Map(courses.map((course) => [course.id, course]));

  if (isLoading) {
    return <div className="text-slate-400">Loading events...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 text-sm">
          No events yet. Create one on the Events page to add assignments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {dayGroups.map((group) => (
        <div key={group.dayKey}>
          <h2 className="text-xl font-bold text-slate-900 mb-3">{group.dayLabel}</h2>
          <div className="border border-slate-300 rounded overflow-x-auto">
            {group.events.map((event) => {
              const eventAssignments = assignments.filter((a) => a.eventId === event.id);
              return (
                <div
                  key={event.id}
                  className="border-b border-slate-200 last:border-b-0 p-4"
                >
                  <p className="text-slate-900 font-medium mb-3">
                    {formatTimeRange(event.startTime, event.endTime)}
                  </p>
                  {eventAssignments.length === 0 ? (
                    <p className="text-slate-500 text-xs italic">No assignments for this event.</p>
                  ) : (
                    <div className="space-y-2">
                      {eventAssignments.map((assignment) => (
                        <AssignmentChip
                          key={assignment.id}
                          assignment={assignment}
                          course={coursesById.get(assignment.courseId)}
                          onDelete={onDeleteAssignment}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
