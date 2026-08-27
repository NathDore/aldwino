export class WorkSessionStateValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkSessionStateValidationError";
  }
}

export class WorkSessionStateInvalidError extends WorkSessionStateValidationError {
  constructor() {
    super("state must be one of INPROGRESS, COMPLETED, SKIPPED, WAIT_CONFIRM");
    this.name = "WorkSessionStateInvalidError";
  }
}
