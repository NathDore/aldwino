import { validateAssignmentId, validateDescription } from "./TaskRules";

export class Task {
  private constructor(
    public readonly id: string,
    public readonly assignmentId: string,
    public readonly description: string,
    public readonly isCompleted: boolean,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    assignmentId: string;
    description: string;
    isCompleted?: boolean;
    createdAt: Date;
  }): Task {
    validateAssignmentId(params.assignmentId);
    validateDescription(params.description);
    return new Task(
      params.id,
      params.assignmentId,
      params.description,
      params.isCompleted ?? false,
      params.createdAt,
    );
  }

  toJSON() {
    return {
      id: this.id,
      assignmentId: this.assignmentId,
      description: this.description,
      isCompleted: this.isCompleted,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
