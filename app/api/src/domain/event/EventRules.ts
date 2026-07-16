import { Event } from "./Event";

export function eventsOverlap(a: Event, b: Event): boolean {
  return a.startTime < b.endTime && b.startTime < a.endTime;
}

export function adjustEndDateToStartDay(startTime: Date, endTime: Date): Date {
  const adjusted = new Date(startTime);
  adjusted.setHours(endTime.getHours(), endTime.getMinutes(), endTime.getSeconds(), endTime.getMilliseconds());
  return adjusted;
}
