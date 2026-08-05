export class WorkSessionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkSessionValidationError";
  }
}

export class WorkSessionStateIdRequiredError extends WorkSessionValidationError {
  constructor() {
    super("workSessionStateId cannot be empty");
    this.name = "WorkSessionStateIdRequiredError";
  }
}

export class StartTimeInvalidError extends WorkSessionValidationError {
  constructor() {
    super("startTime must be a valid date");
    this.name = "StartTimeInvalidError";
  }
}

export class EndTimeInvalidError extends WorkSessionValidationError {
  constructor() {
    super("endTime must be a valid date");
    this.name = "EndTimeInvalidError";
  }
}

export class StartTimeNotBeforeEndTimeError extends WorkSessionValidationError {
  constructor() {
    super("startTime must be before endTime");
    this.name = "StartTimeNotBeforeEndTimeError";
  }
}

export class WorkSessionStateNotFoundError extends Error {
  constructor(workSessionStateId: string) {
    super(`WorkSessionState with id ${workSessionStateId} not found`);
    this.name = "WorkSessionStateNotFoundError";
  }
}
