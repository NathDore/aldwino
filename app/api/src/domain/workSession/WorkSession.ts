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
    public readonly wrapUpAt: Date | null,
    public readonly rescheduleAt: Date | null,
    public readonly waitConfirmAt: Date | null,
    public readonly skippedAt: Date | null,
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
    wrapUpAt?: Date | null;
    rescheduleAt?: Date | null;
    waitConfirmAt?: Date | null;
    skippedAt?: Date | null;
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
      params.wrapUpAt ?? null,
      params.rescheduleAt ?? null,
      params.waitConfirmAt ?? null,
      params.skippedAt ?? null,
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
      wrapUpAt: this.wrapUpAt ? this.wrapUpAt.toISOString() : null,
      rescheduleAt: this.rescheduleAt ? this.rescheduleAt.toISOString() : null,
      waitConfirmAt: this.waitConfirmAt ? this.waitConfirmAt.toISOString() : null,
      skippedAt: this.skippedAt ? this.skippedAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
