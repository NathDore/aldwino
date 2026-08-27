import { validateState } from "./AssignmentStateRules";

export type AssignmentStateName = "UNCOMPLETED" | "COMPLETED" | "SKIPPED" | "WAIT_CONFIRM";

export class AssignmentState {
  private constructor(
    public readonly id: string,
    public readonly state: AssignmentStateName,
  ) {}

  static create(params: { id: string; state: AssignmentStateName }): AssignmentState {
    validateState(params.state);
    return new AssignmentState(params.id, params.state);
  }

  toJSON() {
    return {
      id: this.id,
      state: this.state,
    };
  }
}
