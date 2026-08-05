import {
  validateWorkSessionStateId,
  validateStartTime,
  validateEndTime,
  validateStartBeforeEnd,
  validateSameDay,
} from "./WorkSessionRules";

export class WorkSession {
  private constructor(
    public readonly id: string,
    public readonly workSessionStateId: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly completedAt: Date | null,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    workSessionStateId: string;
    startTime: Date;
    endTime: Date;
    completedAt?: Date | null;
    isDeleted?: boolean;
    deletedAt?: Date | null;
    createdAt: Date;
  }): WorkSession {
    validateWorkSessionStateId(params.workSessionStateId);
    validateStartTime(params.startTime);
    validateEndTime(params.endTime);
    validateStartBeforeEnd(params.startTime, params.endTime);
    validateSameDay(params.startTime, params.endTime);
    return new WorkSession(
      params.id,
      params.workSessionStateId,
      params.startTime,
      params.endTime,
      params.completedAt ?? null,
      params.isDeleted ?? false,
      params.deletedAt ?? null,
      params.createdAt,
    );
  }

  toJSON() {
    return {
      id: this.id,
      workSessionStateId: this.workSessionStateId,
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString(),
      completedAt: this.completedAt ? this.completedAt.toISOString() : null,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt ? this.deletedAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
