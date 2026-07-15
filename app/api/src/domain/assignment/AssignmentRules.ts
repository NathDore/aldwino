import {
  CourseIdRequiredError,
  EventIdRequiredError,
  DescriptionEmptyError,
  DescriptionTooLongError,
} from "./AssignmentError";

const DESCRIPTION_MAX_LENGTH = 250;

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
