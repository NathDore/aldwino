// Format end time based on start time and duration
export function formatEndTime(
  startTime: string,
  durationMinutes: number | null | undefined
): string {
  if (durationMinutes === null || durationMinutes === undefined) {
    return "";
  }

  const start = new Date(startTime);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  return end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
