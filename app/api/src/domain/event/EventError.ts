export class EventValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventValidationError";
  }
}

export class SameDayViolation extends EventValidationError {
  constructor() {
    super("startTime and endTime must be on the same day");
    this.name = "SameDayViolation";
  }
}

export class TimeOrderViolation extends EventValidationError {
  constructor() {
    super("startTime cannot be after endTime");
    this.name = "TimeOrderViolation";
  }
}

export class ZeroDurationViolation extends EventValidationError {
  constructor() {
    super("startTime cannot be equal to endTime");
    this.name = "ZeroDurationViolation";
  }
}
