export class TaskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TaskValidationError";
  }
}

export class AssignmentIdRequiredError extends TaskValidationError {
  constructor() {
    super("assignmentId cannot be empty");
    this.name = "AssignmentIdRequiredError";
  }
}

export class DescriptionEmptyError extends TaskValidationError {
  constructor() {
    super("description cannot be empty");
    this.name = "DescriptionEmptyError";
  }
}

export class DescriptionTooLongError extends TaskValidationError {
  constructor() {
    super("description must not exceed 250 characters");
    this.name = "DescriptionTooLongError";
  }
}

export class AssignmentNotFoundError extends Error {
  constructor(assignmentId: string) {
    super(`Assignment with id ${assignmentId} not found`);
    this.name = "AssignmentNotFoundError";
  }
}
