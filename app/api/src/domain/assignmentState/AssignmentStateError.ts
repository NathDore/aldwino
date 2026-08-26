export class AssignmentStateValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssignmentStateValidationError";
  }
}

export class AssignmentStateInvalidError extends AssignmentStateValidationError {
  constructor() {
    super("state must be one of UNCOMPLETED, COMPLETED, SKIPPED, WAIT_CONFIRM");
    this.name = "AssignmentStateInvalidError";
  }
}
