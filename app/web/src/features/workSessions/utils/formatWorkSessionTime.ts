export function formatWorkSessionTimeRange(startTime: string, endTime: string): string {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${new Date(startTime).toLocaleTimeString(undefined, opts)} – ${new Date(endTime).toLocaleTimeString(undefined, opts)}`;
}

export function formatWorkSessionDateHeading(startTime: string): { weekday: string; date: string } {
  const d = new Date(startTime);
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "long" }),
    date: d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
  };
}
