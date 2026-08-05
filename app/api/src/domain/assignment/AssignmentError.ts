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

export class AssignmentStateIdRequiredError extends AssignmentValidationError {
  constructor() {
    super("assignmentStateId cannot be empty");
    this.name = "AssignmentStateIdRequiredError";
  }
}

export class NameEmptyError extends AssignmentValidationError {
  constructor() {
    super("name cannot be empty");
    this.name = "NameEmptyError";
  }
}

export class NameTooLongError extends AssignmentValidationError {
  constructor() {
    super("name must not exceed 250 characters");
    this.name = "NameTooLongError";
  }
}

export class DueDateInvalidError extends AssignmentValidationError {
  constructor() {
    super("dueDate must be a valid date");
    this.name = "DueDateInvalidError";
  }
}

export class CourseNotFoundError extends Error {
  constructor(courseId: string) {
    super(`Course with id ${courseId} not found`);
    this.name = "CourseNotFoundError";
  }
}

export class AssignmentStateNotFoundError extends Error {
  constructor(assignmentStateId: string) {
    super(`AssignmentState with id ${assignmentStateId} not found`);
    this.name = "AssignmentStateNotFoundError";
  }
}
