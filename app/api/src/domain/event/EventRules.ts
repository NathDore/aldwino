import { Event } from "./Event";

export interface TimeRange {
  startTime: Date;
  endTime: Date;
}

export function rangesOverlap(a: TimeRange, b: TimeRange): boolean {
  return a.startTime < b.endTime && b.startTime < a.endTime;
}

export function eventsOverlap(a: Event, b: Event): boolean {
  return rangesOverlap(a, b);
}

export function adjustEndDateToStartDay(startTime: Date, endTime: Date): Date {
  const adjusted = new Date(startTime);
  adjusted.setHours(endTime.getHours(), endTime.getMinutes(), endTime.getSeconds(), endTime.getMilliseconds());
  return adjusted;
}
