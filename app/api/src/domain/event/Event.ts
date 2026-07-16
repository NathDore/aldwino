import { TimeOrderViolation, ZeroDurationViolation } from "./EventError";
import { adjustEndDateToStartDay } from "./EventRules";

export class Event {
  private constructor(
    public readonly id: string,
    public readonly startTime: Date,
    public readonly endTime: Date,
    public readonly createdAt: Date,
  ) {}

  static create(params: {
    id: string;
    startTime: Date;
    endTime: Date;
    createdAt: Date;
  }): Event {
    const adjustedEndTime = adjustEndDateToStartDay(params.startTime, params.endTime);
    this.validateTimeOrder(params.startTime, adjustedEndTime);
    return new Event(params.id, params.startTime, adjustedEndTime, params.createdAt);
  }

  private static validateTimeOrder(startTime: Date, endTime: Date): void {
    if (startTime > endTime) {
      throw new TimeOrderViolation();
    }
    if (startTime.getTime() === endTime.getTime()) {
      throw new ZeroDurationViolation();
    }
  }

  toJSON() {
    return {
      id: this.id,
      startTime: this.startTime.toISOString(),
      endTime: this.endTime.toISOString(),
      createdAt: this.createdAt.toISOString(),
    };
  }
}
