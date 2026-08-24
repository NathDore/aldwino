import { validateAssignmentId, validateWorkSessionId } from "./AssignmentWorkSessionRules";

export type AssignmentWorkSessionDetachReason = "MANUAL" | "COMPLETION";

export class AssignmentWorkSession {
  private constructor(
    public readonly id: string,
    public readonly assignmentId: string,
    public readonly workSessionId: string,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
    public readonly workedOn: boolean,
    public readonly detachReason: AssignmentWorkSessionDetachReason | null,
  ) {}

  static create(params: {
    id: string;
    assignmentId: string;
    workSessionId: string;
    isDeleted?: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
    workedOn?: boolean;
    detachReason?: AssignmentWorkSessionDetachReason | null;
  }): AssignmentWorkSession {
    validateAssignmentId(params.assignmentId);
    validateWorkSessionId(params.workSessionId);
    return new AssignmentWorkSession(
      params.id,
      params.assignmentId,
      params.workSessionId,
      params.isDeleted ?? false,
      params.deletedAt ?? null,
      params.createdAt,
      params.workedOn ?? false,
      params.detachReason ?? null,
    );
  }

  toJSON() {
    return {
      id: this.id,
      assignmentId: this.assignmentId,
      workSessionId: this.workSessionId,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt ? this.deletedAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
      workedOn: this.workedOn,
      detachReason: this.detachReason,
    };
  }
}
