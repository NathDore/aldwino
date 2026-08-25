export const ALLOWED_DURATIONS_MINUTES = [15, 25, 50, 60, 90] as const;

export const MIN_DURATION_MINUTES = 1;
export const MAX_DURATION_MINUTES = 480;

export function isValidDurationMinutes(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= MIN_DURATION_MINUTES && minutes <= MAX_DURATION_MINUTES;
}

export function formatDurationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function dateToDateInput(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")}`;
}

export function isoToDateInput(iso: string): string {
  return dateToDateInput(new Date(iso));
}

function dateToTimeInput(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function isoToTimeInput(iso: string): string {
  return dateToTimeInput(new Date(iso));
}

export function combineDateAndTime(day: string, time: string): Date {
  return new Date(`${day}T${time}:00`);
}

export interface FittingDuration {
  minutes: number | null;
  clamped: boolean;
}

export function computeFittingDuration(start: Date, requestedMinutes: number): FittingDuration {
  const midnightNext = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1, 0, 0, 0, 0);
  const availableMinutes = Math.floor((midnightNext.getTime() - start.getTime()) / 60000);

  if (requestedMinutes < availableMinutes) {
    return { minutes: requestedMinutes, clamped: false };
  }

  const fitting = ALLOWED_DURATIONS_MINUTES.filter((minutes) => minutes < availableMinutes);
  if (fitting.length === 0) {
    return { minutes: null, clamped: true };
  }
  return { minutes: Math.max(...fitting), clamped: true };
}
