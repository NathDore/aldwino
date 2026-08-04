import { Event } from "../../domain/event/Event";
import { deriveEventCompletion } from "../../domain/event/EventRules";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IEventRepository } from "../../infrastructure/database/repositories/EventRepository";

export function recomputeEventStatus(
  event: Event,
  assignmentRepository: IAssignmentRepository,
  eventRepository: IEventRepository,
  now: Date,
): Event {
  const assignments = assignmentRepository.getByEventId(event.id);
  const liveCompletion = deriveEventCompletion(
    event.endTime,
    assignments.map((a) => a.isCompleted),
    now,
  );

  if (liveCompletion === null || liveCompletion === event.isCompleted) {
    return event;
  }

  const updated = Event.create({
    id: event.id,
    startTime: event.startTime,
    endTime: event.endTime,
    createdAt: event.createdAt,
    isCompleted: liveCompletion,
  });
  return eventRepository.update(updated);
}
