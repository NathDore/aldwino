import {
  CourseIdRequiredError,
  AssignmentStateIdRequiredError,
  NameEmptyError,
  NameTooLongError,
  DueDateInvalidError,
  DueDateInPastError,
} from "./AssignmentError";

const NAME_MAX_LENGTH = 250;

export function validateCourseId(courseId: string): void {
  if (courseId.length === 0) {
    throw new CourseIdRequiredError();
  }
}

export function validateAssignmentStateId(assignmentStateId: string): void {
  if (assignmentStateId.length === 0) {
    throw new AssignmentStateIdRequiredError();
  }
}

export function validateName(name: string): void {
  if (name.length === 0) {
    throw new NameEmptyError();
  }
  if (name.length > NAME_MAX_LENGTH) {
    throw new NameTooLongError();
  }
}

export function validateDueDate(dueDate: Date): void {
  if (isNaN(dueDate.getTime())) {
    throw new DueDateInvalidError();
  }
}

export function validateDueDateNotInPast(dueDate: Date, now: Date): void {
  validateDueDate(dueDate);
  if (dueDate < now) {
    throw new DueDateInPastError();
  }
}
