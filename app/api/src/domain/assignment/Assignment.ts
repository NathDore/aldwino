import { validateCourseId, validateAssignmentStateId, validateName, validateDueDate } from "./AssignmentRules";

export class Assignment {
  private constructor(
    public readonly id: string,
    public readonly courseId: string,
    public readonly assignmentStateId: string,
    public readonly name: string,
    public readonly dueDate: Date,
    public readonly completedAt: Date | null,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
    public readonly wrapUpAt: Date | null,
    public readonly rescheduleAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    courseId: string;
    assignmentStateId: string;
    name: string;
    dueDate: Date;
    completedAt?: Date | null;
    isDeleted?: boolean;
    deletedAt?: Date | null;
    wrapUpAt?: Date | null;
    rescheduleAt?: Date | null;
    createdAt: Date;
  }): Assignment {
    validateCourseId(params.courseId);
    validateAssignmentStateId(params.assignmentStateId);
    validateName(params.name);
    validateDueDate(params.dueDate);
    return new Assignment(
      params.id,
      params.courseId,
      params.assignmentStateId,
      params.name,
      params.dueDate,
      params.completedAt ?? null,
      params.isDeleted ?? false,
      params.deletedAt ?? null,
      params.wrapUpAt ?? null,
      params.rescheduleAt ?? null,
      params.createdAt,
    );
  }

  toJSON() {
    return {
      id: this.id,
      courseId: this.courseId,
      assignmentStateId: this.assignmentStateId,
      name: this.name,
      dueDate: this.dueDate.toISOString(),
      completedAt: this.completedAt ? this.completedAt.toISOString() : null,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt ? this.deletedAt.toISOString() : null,
      wrapUpAt: this.wrapUpAt ? this.wrapUpAt.toISOString() : null,
      rescheduleAt: this.rescheduleAt ? this.rescheduleAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
