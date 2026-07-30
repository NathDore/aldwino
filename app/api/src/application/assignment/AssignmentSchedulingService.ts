import { Assignment } from "../../domain/assignment/Assignment";
import { Event } from "../../domain/event/Event";
import { rangesOverlap, type TimeRange } from "../../domain/event/EventRules";
import type { IAssignmentRepository } from "../../infrastructure/database/repositories/AssignmentRepository";
import type { IEventRepository } from "../../infrastructure/database/repositories/EventRepository";
import type { Clock } from "../health/ports/Clock";

export class AssignmentSchedulingService {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly assignmentRepository: IAssignmentRepository,
    private readonly clock: Clock,
  ) { }

  placeNewSession(startTime: Date, endTime: Date): string {
    return this.resolveEventForWindow({ startTime, endTime });
  }

  rescheduleSession(
    assignmentId: string,
    previousEventId: string,
    startTime: Date,
    endTime: Date,
  ): string {
    const eventId = this.resolveEventForWindow({ startTime, endTime }, assignmentId);
    if (eventId !== previousEventId) {
      this.recomputeOrDeleteEvent(previousEventId, assignmentId);
    }
    return eventId;
  }

  releaseSession(assignmentId: string, previousEventId: string): void {
    this.recomputeOrDeleteEvent(previousEventId, assignmentId);
  }

  private resolveEventForWindow(window: TimeRange, excludeAssignmentId?: string): string {
    const overlapping = this.eventRepository.getAll().filter((event) => rangesOverlap(window, event));

    if (overlapping.length === 0) {
      const event = Event.create({
        id: crypto.randomUUID(),
        startTime: window.startTime,
        endTime: window.endTime,
        createdAt: this.clock.now(),
      });
      this.eventRepository.create(event);
      return event.id;
    }

    const survivor = overlapping.reduce((oldest, candidate) =>
      candidate.createdAt < oldest.createdAt ? candidate : oldest,
    );

    let mergedStart = window.startTime;
    let mergedEnd = window.endTime;
    for (const event of overlapping) {
      if (event.startTime < mergedStart) mergedStart = event.startTime;
      if (event.endTime > mergedEnd) mergedEnd = event.endTime;
    }

    for (const loser of overlapping) {
      if (loser.id === survivor.id) continue;
      const members = this.assignmentRepository
        .getByEventId(loser.id)
        .filter((assignment) => assignment.id !== excludeAssignmentId);
      for (const member of members) {
        this.assignmentRepository.update(this.withEventId(member, survivor.id));
      }
      this.eventRepository.delete(loser.id);
    }

    if (mergedStart.getTime() !== survivor.startTime.getTime() || mergedEnd.getTime() !== survivor.endTime.getTime()) {
      this.eventRepository.update(
        Event.create({ id: survivor.id, startTime: mergedStart, endTime: mergedEnd, createdAt: survivor.createdAt }),
      );
    }

    return survivor.id;
  }

  private recomputeOrDeleteEvent(eventId: string, excludeAssignmentId: string): void {
    const remaining = this.assignmentRepository
      .getByEventId(eventId)
      .filter((assignment) => assignment.id !== excludeAssignmentId);

    if (remaining.length === 0) {
      this.eventRepository.delete(eventId);
      return;
    }

    const existing = this.eventRepository.getById(eventId);
    if (!existing) {
      return;
    }

    let start = this.sessionStart(remaining[0]!);
    let end = this.sessionEnd(remaining[0]!);
    for (const assignment of remaining.slice(1)) {
      const assignmentStart = this.sessionStart(assignment);
      const assignmentEnd = this.sessionEnd(assignment);
      if (assignmentStart < start) start = assignmentStart;
      if (assignmentEnd > end) end = assignmentEnd;
    }

    this.eventRepository.update(Event.create({ id: eventId, startTime: start, endTime: end, createdAt: existing.createdAt }));
  }

  private sessionStart(assignment: Assignment): Date {
    return assignment.startTime;
  }

  private sessionEnd(assignment: Assignment): Date {
    return new Date(assignment.startTime.getTime() + assignment.expectedDurationMinutes * 60000);
  }

  private withEventId(assignment: Assignment, eventId: string): Assignment {
    return Assignment.create({
      id: assignment.id,
      courseId: assignment.courseId,
      eventId,
      description: assignment.description,
      dueDate: assignment.dueDate,
      startTime: assignment.startTime,
      expectedDurationMinutes: assignment.expectedDurationMinutes,
      isCompleted: assignment.isCompleted,
      completedAt: assignment.completedAt,
      isDeleted: assignment.isDeleted,
      deletedAt: assignment.deletedAt,
      createdAt: assignment.createdAt,
    });
  }
}
