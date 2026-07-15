import { SameDayViolation, TimeOrderViolation, ZeroDurationViolation } from "./EventError";

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
    this.validateSameDay(params.startTime, params.endTime);
    this.validateTimeOrder(params.startTime, params.endTime);
    return new Event(params.id, params.startTime, params.endTime, params.createdAt);
  }

  private static validateSameDay(startTime: Date, endTime: Date): void {
    const startDate = startTime.toDateString();
    const endDate = endTime.toDateString();
    if (startDate !== endDate) {
      throw new SameDayViolation();
    }
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
