import type { AssignmentLifecycleState } from "./AssignmentLifecycle";

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

export class DueDateInPastError extends AssignmentValidationError {
  constructor() {
    super("dueDate must be in the future");
    this.name = "DueDateInPastError";
  }
}

export class AssignmentStateTransitionError extends Error {
  constructor(
    message: string,
    public readonly state: AssignmentLifecycleState,
  ) {
    super(message);
    this.name = "AssignmentStateTransitionError";
  }
}

export class CannotCompleteAssignmentError extends AssignmentStateTransitionError {
  constructor(state: AssignmentLifecycleState) {
    super(`Cannot complete an assignment in the ${state} state`, state);
    this.name = "CannotCompleteAssignmentError";
  }
}

export class CannotUncompleteAssignmentError extends AssignmentStateTransitionError {
  constructor(state: AssignmentLifecycleState) {
    super(`Cannot mark an assignment in the ${state} state as incomplete`, state);
    this.name = "CannotUncompleteAssignmentError";
  }
}

export class CannotEditAssignmentError extends AssignmentStateTransitionError {
  constructor(state: AssignmentLifecycleState) {
    super(`Cannot edit an assignment in the ${state} state`, state);
    this.name = "CannotEditAssignmentError";
  }
}

export class CannotDeleteAssignmentError extends AssignmentStateTransitionError {
  constructor(state: AssignmentLifecycleState) {
    super(`Cannot remove an assignment in the ${state} state`, state);
    this.name = "CannotDeleteAssignmentError";
  }
}

export class CannotRescheduleAssignmentError extends AssignmentStateTransitionError {
  constructor(state: AssignmentLifecycleState) {
    super(`Cannot reschedule an assignment in the ${state} state`, state);
    this.name = "CannotRescheduleAssignmentError";
  }
}

export class CannotLinkAssignmentError extends AssignmentStateTransitionError {
  constructor(state: AssignmentLifecycleState) {
    super(`Cannot link or unlink a work session for an assignment in the ${state} state`, state);
    this.name = "CannotLinkAssignmentError";
  }
}

export class AssignmentNotCompletedError extends AssignmentStateTransitionError {
  constructor(state: AssignmentLifecycleState) {
    super(`Assignment must be completed before it can be wrapped up (state: ${state})`, state);
    this.name = "AssignmentNotCompletedError";
  }
}

export class AssignmentNotOverdueError extends AssignmentStateTransitionError {
  constructor(state: AssignmentLifecycleState) {
    super(`Assignment must be overdue and not already completed to be wrapped up late (state: ${state})`, state);
    this.name = "AssignmentNotOverdueError";
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
