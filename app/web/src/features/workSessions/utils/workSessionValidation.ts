export function validateStartNotInPast(start: Date, now: Date = new Date()): string | undefined {
  if (start < now) {
    return "Start time cannot be in the past";
  }
  return undefined;
}

export function validateSameCalendarDay(start: Date, end: Date): string | undefined {
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();
  if (!sameDay) {
    return "Start and end time must be on the same day";
  }
  return undefined;
}
