export const COMPACT_EVENT_THRESHOLD_MINUTES = 50;

export function getEventDurationMinutes(startTime: string, endTime: string): number {
  return (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000;
}
