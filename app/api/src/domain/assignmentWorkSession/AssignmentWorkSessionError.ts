export class AssignmentWorkSessionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssignmentWorkSessionValidationError";
  }
}

export class AssignmentIdRequiredError extends AssignmentWorkSessionValidationError {
  constructor() {
    super("assignmentId cannot be empty");
    this.name = "AssignmentIdRequiredError";
  }
}

export class WorkSessionIdRequiredError extends AssignmentWorkSessionValidationError {
  constructor() {
    super("workSessionId cannot be empty");
    this.name = "WorkSessionIdRequiredError";
  }
}

export class AssignmentNotFoundError extends Error {
  constructor(assignmentId: string) {
    super(`Assignment with id ${assignmentId} not found`);
    this.name = "AssignmentNotFoundError";
  }
}

export class WorkSessionNotFoundError extends Error {
  constructor(workSessionId: string) {
    super(`WorkSession with id ${workSessionId} not found`);
    this.name = "WorkSessionNotFoundError";
  }
}

export class WorkSessionCompletedError extends Error {
  constructor(workSessionId: string) {
    super(`WorkSession with id ${workSessionId} is completed and cannot be linked or unlinked`);
    this.name = "WorkSessionCompletedError";
  }
}

export class CannotDeleteAutoDetachedLinkError extends Error {
  constructor(id: string) {
    super(
      `AssignmentWorkSession with id ${id} was auto-detached by completing its assignment and cannot be deleted directly; it is restored automatically if the assignment is uncompleted`,
    );
    this.name = "CannotDeleteAutoDetachedLinkError";
  }
}
