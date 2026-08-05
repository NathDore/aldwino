import { AssignmentIdRequiredError, WorkSessionIdRequiredError } from "./AssignmentWorkSessionError";

export function validateAssignmentId(assignmentId: string): void {
  if (assignmentId.length === 0) {
    throw new AssignmentIdRequiredError();
  }
}

export function validateWorkSessionId(workSessionId: string): void {
  if (workSessionId.length === 0) {
    throw new WorkSessionIdRequiredError();
  }
}
