export class NotificationValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationValidationError";
  }
}

export class NotificationTypeInvalidError extends NotificationValidationError {
  constructor() {
    super("type must be one of WORK_SESSION_SKIPPED, ASSIGNMENT_DUE_SOON, ASSIGNMENT_OVERDUE");
    this.name = "NotificationTypeInvalidError";
  }
}

export class NotificationEntityTypeInvalidError extends NotificationValidationError {
  constructor() {
    super("entityType must be one of ASSIGNMENT, WORK_SESSION");
    this.name = "NotificationEntityTypeInvalidError";
  }
}

export class NotificationEntityIdRequiredError extends NotificationValidationError {
  constructor() {
    super("entityId cannot be empty");
    this.name = "NotificationEntityIdRequiredError";
  }
}

export class NotificationNotFoundError extends Error {
  constructor(id: string) {
    super(`Notification with id ${id} not found`);
    this.name = "NotificationNotFoundError";
  }
}

export class NotificationStateTransitionError extends Error {
  constructor(
    message: string,
    public readonly state: string,
  ) {
    super(message);
    this.name = "NotificationStateTransitionError";
  }
}

export class CannotRemoveNotificationError extends NotificationStateTransitionError {
  constructor(state: string) {
    super(`Cannot remove a notification in the ${state} state`, state);
    this.name = "CannotRemoveNotificationError";
  }
}
