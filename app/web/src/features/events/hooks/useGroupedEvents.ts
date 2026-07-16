import type { EventDto } from "../types/event.types";

export interface EventDayGroup {
  dayKey: string;
  dayLabel: string;
  events: EventDto[];
}

export function useGroupedEvents(events: EventDto[]): EventDayGroup[] {
  const groups = new Map<string, EventDto[]>();

  for (const event of events) {
    const dayKey = new Date(event.startTime).toDateString();
    const existing = groups.get(dayKey);
    if (existing) {
      existing.push(event);
    } else {
      groups.set(dayKey, [event]);
    }
  }

  return Array.from(groups.entries())
    .map(([dayKey, dayEvents]) => ({
      dayKey,
      dayLabel: new Date(dayEvents[0].startTime).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      events: [...dayEvents].sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    }))
    .sort((a, b) => new Date(a.events[0].startTime).getTime() - new Date(b.events[0].startTime).getTime());
}
