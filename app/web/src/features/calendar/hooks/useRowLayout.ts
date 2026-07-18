import { useMemo } from "react";
import type { CalendarEvent } from "../types/calendar.types";

export const HOUR_ROW_HEIGHT = 60;
export const EXPANDED_MIN_HEIGHT = 220;
export const EXPANDED_MAX_HEIGHT = 640;
export const EXPANDED_CONTENT_PADDING = 16;

export interface RowLayout {
  rowHeights: number[];
  rowOffsets: number[];
  totalHeight: number;
}

export function minutesToPx(minutes: number, rowLayout: RowLayout): number {
  const hour = Math.min(Math.floor(minutes / 60), 23);
  const minuteInHour = minutes - hour * 60;
  return rowLayout.rowOffsets[hour] + (minuteInHour / 60) * rowLayout.rowHeights[hour];
}

function getEventSpan(
  startTime: string,
  endTime: string
): { startHour: number; endHour: number; durationMinutes: number } {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutesRaw = end.getHours() * 60 + end.getMinutes();
  const durationMinutes = Math.max(endMinutesRaw - startMinutes, 15);
  const endMinutes = startMinutes + durationMinutes;
  const startHour = start.getHours();
  const endHour = Math.min(23, Math.max(startHour, Math.ceil(endMinutes / 60) - 1));
  return { startHour, endHour, durationMinutes };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function useRowLayout(
  events: CalendarEvent[],
  expandedEventId: string | null,
  expandedContentHeight: number | null
): RowLayout {
  return useMemo(() => {
    const rowHeights = Array.from({ length: 24 }, () => HOUR_ROW_HEIGHT);

    const expandedEvent = expandedEventId
      ? events.find((calendarEvent) => calendarEvent.event.id === expandedEventId)
      : undefined;

    if (expandedEvent) {
      const { startHour, endHour, durationMinutes } = getEventSpan(
        expandedEvent.event.startTime,
        expandedEvent.event.endTime
      );
      const desiredTotal = clamp(
        (expandedContentHeight ?? 0) + EXPANDED_CONTENT_PADDING,
        EXPANDED_MIN_HEIGHT,
        EXPANDED_MAX_HEIGHT
      );
      const durationHours = durationMinutes / 60;
      const perHour = Math.max(HOUR_ROW_HEIGHT, desiredTotal / durationHours);
      for (let hour = startHour; hour <= endHour; hour++) {
        rowHeights[hour] = perHour;
      }
    }

    const rowOffsets: number[] = [];
    let cumulative = 0;
    for (let hour = 0; hour < 24; hour++) {
      rowOffsets[hour] = cumulative;
      cumulative += rowHeights[hour];
    }

    return { rowHeights, rowOffsets, totalHeight: cumulative };
  }, [events, expandedEventId, expandedContentHeight]);
}
