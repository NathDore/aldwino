import { AssignmentStateInvalidError } from "./AssignmentStateError";
import type { AssignmentStateName } from "./AssignmentState";

export const ASSIGNMENT_STATES: readonly AssignmentStateName[] = ["UNCOMPLETED", "COMPLETED", "SKIPPED"];

export function validateState(state: AssignmentStateName): void {
  if (!ASSIGNMENT_STATES.includes(state)) {
    throw new AssignmentStateInvalidError();
  }
}
