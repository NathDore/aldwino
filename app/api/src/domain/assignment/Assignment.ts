import { validateCourseId, validateEventId, validateDescription } from "./AssignmentRules";

export class Assignment {
  private constructor(
    public readonly id: string,
    public readonly courseId: string,
    public readonly eventId: string,
    public readonly description: string,
    public readonly dueDate: Date,
    public readonly isCompleted: boolean,
    public readonly completedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    courseId: string;
    eventId: string;
    description: string;
    dueDate: Date;
    isCompleted?: boolean;
    completedAt?: Date | null;
    createdAt: Date;
  }): Assignment {
    validateCourseId(params.courseId);
    validateEventId(params.eventId);
    validateDescription(params.description);
    return new Assignment(
      params.id,
      params.courseId,
      params.eventId,
      params.description,
      params.dueDate,
      params.isCompleted ?? false,
      params.completedAt ?? null,
      params.createdAt,
    );
  }

  toJSON() {
    return {
      id: this.id,
      courseId: this.courseId,
      eventId: this.eventId,
      description: this.description,
      dueDate: this.dueDate.toISOString(),
      isCompleted: this.isCompleted,
      completedAt: this.completedAt ? this.completedAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
