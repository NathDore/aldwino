import { WorkSessionStateInvalidError } from "./WorkSessionStateError";
import type { WorkSessionStateName } from "./WorkSessionState";

export const WORK_SESSION_STATES: readonly WorkSessionStateName[] = ["INPROGRESS", "COMPLETED", "SKIPPED"];

export function validateState(state: WorkSessionStateName): void {
  if (!WORK_SESSION_STATES.includes(state)) {
    throw new WorkSessionStateInvalidError();
  }
}
