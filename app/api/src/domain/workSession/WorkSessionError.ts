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

export class SpansMultipleDaysError extends WorkSessionValidationError {
  constructor() {
    super("startTime and endTime must fall on the same calendar day");
    this.name = "SpansMultipleDaysError";
  }
}

export class CannotUncompletePastWorkSessionError extends WorkSessionValidationError {
  constructor() {
    super("Cannot mark a work session as incomplete once its end time has passed.");
    this.name = "CannotUncompletePastWorkSessionError";
  }
}

export class WorkSessionNotCompletedError extends WorkSessionValidationError {
  constructor() {
    super("WorkSession must be completed before it can be wrapped up");
    this.name = "WorkSessionNotCompletedError";
  }
}

export class StartTimeInPastError extends WorkSessionValidationError {
  constructor() {
    super("startTime must not be in the past");
    this.name = "StartTimeInPastError";
  }
}

export class CannotRescheduleNonSkippedWorkSessionError extends WorkSessionValidationError {
  constructor(state: string) {
    super(`Only a skipped work session can be rescheduled (state: ${state})`);
    this.name = "CannotRescheduleNonSkippedWorkSessionError";
  }
}

export class CannotEditNonInProgressWorkSessionError extends WorkSessionValidationError {
  constructor(state: string) {
    super(`Only an in-progress work session can be edited (state: ${state})`);
    this.name = "CannotEditNonInProgressWorkSessionError";
  }
}

export class WorkSessionStateNotFoundError extends Error {
  constructor(workSessionStateId: string) {
    super(`WorkSessionState with id ${workSessionStateId} not found`);
    this.name = "WorkSessionStateNotFoundError";
  }
}
