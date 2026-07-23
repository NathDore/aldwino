import {
  validateCourseId,
  validateEventId,
  validateDescription,
  validateStartTime,
  validateExpectedDurationMinutes,
  validateSessionWithinSingleDay,
} from "./AssignmentRules";

export class Assignment {
  private constructor(
    public readonly id: string,
    public readonly courseId: string,
    public readonly eventId: string,
    public readonly description: string,
    public readonly dueDate: Date,
    public readonly startTime: Date,
    public readonly expectedDurationMinutes: number,
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
    startTime: Date;
    expectedDurationMinutes: number;
    isCompleted?: boolean;
    completedAt?: Date | null;
    createdAt: Date;
  }): Assignment {
    validateCourseId(params.courseId);
    validateEventId(params.eventId);
    validateDescription(params.description);
    validateStartTime(params.startTime);
    validateExpectedDurationMinutes(params.expectedDurationMinutes);
    const endTime = new Date(params.startTime.getTime() + params.expectedDurationMinutes * 60000);
    validateSessionWithinSingleDay(params.startTime, endTime);
    return new Assignment(
      params.id,
      params.courseId,
      params.eventId,
      params.description,
      params.dueDate,
      params.startTime,
      params.expectedDurationMinutes,
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
      startTime: this.startTime.toISOString(),
      expectedDurationMinutes: this.expectedDurationMinutes,
      isCompleted: this.isCompleted,
      completedAt: this.completedAt ? this.completedAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
