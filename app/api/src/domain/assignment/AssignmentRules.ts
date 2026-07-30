import {
  CourseIdRequiredError,
  EventIdRequiredError,
  DescriptionEmptyError,
  DescriptionTooLongError,
  StartTimeInvalidError,
  DurationNotAllowedError,
  SessionCrossesMidnightError,
  AssignmentNotCompletedError,
} from "./AssignmentError";

const DESCRIPTION_MAX_LENGTH = 250;

export const ALLOWED_DURATIONS_MINUTES: readonly number[] = [15, 25, 50, 60, 90];

export function validateCourseId(courseId: string): void {
  if (courseId.length === 0) {
    throw new CourseIdRequiredError();
  }
}

export function validateEventId(eventId: string): void {
  if (eventId.length === 0) {
    throw new EventIdRequiredError();
  }
}

export function validateDescription(description: string): void {
  if (description.length === 0) {
    throw new DescriptionEmptyError();
  }
  if (description.length > DESCRIPTION_MAX_LENGTH) {
    throw new DescriptionTooLongError();
  }
}

export function validateStartTime(startTime: Date): void {
  if (isNaN(startTime.getTime())) {
    throw new StartTimeInvalidError();
  }
}

export function validateExpectedDurationMinutes(minutes: number): void {
  if (!ALLOWED_DURATIONS_MINUTES.includes(minutes)) {
    throw new DurationNotAllowedError();
  }
}

export function validateSessionWithinSingleDay(startTime: Date, endTime: Date): void {
  if (startTime.toDateString() !== endTime.toDateString()) {
    throw new SessionCrossesMidnightError();
  }
}

export function validateCanBeDeleted(isCompleted: boolean): void {
  if (!isCompleted) {
    throw new AssignmentNotCompletedError();
  }
}
