import { validateAssignmentId, validateWorkSessionId } from "./AssignmentWorkSessionRules";

export class AssignmentWorkSession {
  private constructor(
    public readonly id: string,
    public readonly assignmentId: string,
    public readonly workSessionId: string,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    assignmentId: string;
    workSessionId: string;
    isDeleted?: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
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
    };
  }
}
