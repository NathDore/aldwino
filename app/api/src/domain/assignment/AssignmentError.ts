export class AssignmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssignmentValidationError";
  }
}

export class CourseIdRequiredError extends AssignmentValidationError {
  constructor() {
    super("courseId cannot be empty");
    this.name = "CourseIdRequiredError";
  }
}

export class EventIdRequiredError extends AssignmentValidationError {
  constructor() {
    super("eventId cannot be empty");
    this.name = "EventIdRequiredError";
  }
}

export class DescriptionEmptyError extends AssignmentValidationError {
  constructor() {
    super("description cannot be empty");
    this.name = "DescriptionEmptyError";
  }
}

export class DescriptionTooLongError extends AssignmentValidationError {
  constructor() {
    super("description must not exceed 250 characters");
    this.name = "DescriptionTooLongError";
  }
}

export class CourseNotFoundError extends Error {
  constructor(courseId: string) {
    super(`Course with id ${courseId} not found`);
    this.name = "CourseNotFoundError";
  }
}

export class EventNotFoundError extends Error {
  constructor(eventId: string) {
    super(`Event with id ${eventId} not found`);
    this.name = "EventNotFoundError";
  }
}

export class StartTimeInvalidError extends AssignmentValidationError {
  constructor() {
    super("startTime must be a valid date");
    this.name = "StartTimeInvalidError";
  }
}

export class DurationNotAllowedError extends AssignmentValidationError {
  constructor() {
    super("expectedDurationMinutes must be one of 15, 25, 50, 60, 90");
    this.name = "DurationNotAllowedError";
  }
}

export class SessionCrossesMidnightError extends AssignmentValidationError {
  constructor() {
    super("startTime plus expectedDurationMinutes must not cross midnight");
    this.name = "SessionCrossesMidnightError";
  }
}
