import { validateState } from "./WorkSessionStateRules";

export type WorkSessionStateName = "INPROGRESS" | "COMPLETED" | "SKIPPED";

export class WorkSessionState {
  private constructor(
    public readonly id: string,
    public readonly state: WorkSessionStateName,
  ) {}

  static create(params: { id: string; state: WorkSessionStateName }): WorkSessionState {
    validateState(params.state);
    return new WorkSessionState(params.id, params.state);
  }

  toJSON() {
    return {
      id: this.id,
      state: this.state,
    };
  }
}
