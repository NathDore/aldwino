import { useMemo, useRef } from "react";
import { useCalendarStore } from "../store/calendarStore";
import { useWeekDays, toISODate } from "../hooks/useWeekDays";
import { useRowLayout } from "../hooks/useRowLayout";
import { useScrollToNowOnMount } from "../hooks/useScrollToNowOnMount";
import { DayColumn } from "./DayColumn";
import { DayHeaderCell } from "./DayHeaderCell";
import type { CalendarEvent } from "../types/calendar.types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const EMPTY_EVENTS: CalendarEvent[] = [];

function formatHourLabel(hour: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
}

interface WeekGridProps {
  calendarEvents: CalendarEvent[];
}

export function WeekGrid({ calendarEvents }: WeekGridProps) {
  const currentWeekStart = useCalendarStore((s) => s.currentWeekStart);
  const days = useWeekDays(currentWeekStart);
  const today = toISODate(new Date());
  const rowLayout = useRowLayout();

  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const todayInView = days.some((day) => toISODate(day) === today);
  useScrollToNowOnMount({ headerRef, bodyRef, rowLayout, enabled: todayInView });

  const handleBodyScroll = () => {
    if (headerRef.current && bodyRef.current) {
      headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
    }
  };

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const calendarEvent of calendarEvents) {
      const dayIso = toISODate(new Date(calendarEvent.event.startTime));
      const existing = map.get(dayIso);
      if (existing) {
        existing.push(calendarEvent);
      } else {
        map.set(dayIso, [calendarEvent]);
      }
    }
    return map;
  }, [calendarEvents]);

  return (
    <div className="border border-slate-200 rounded-lg">
      <div ref={headerRef} className="overflow-x-hidden sticky top-14 z-40 bg-white border-b border-slate-200">
        <div className="flex min-w-[900px]">
          <div className="w-16 shrink-0 border-r border-slate-200" />
          {days.map((day) => (
            <DayHeaderCell key={toISODate(day)} date={day} isToday={toISODate(day) === today} />
          ))}
        </div>
      </div>

      <div ref={bodyRef} onScroll={handleBodyScroll} className="overflow-x-auto">
        <div className="flex min-w-[900px]">
          <div className="w-16 shrink-0 border-r border-slate-200">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="border-b border-slate-200 text-xs text-slate-600 pr-2 pt-1 text-right"
                style={{ height: rowLayout.rowHeights[hour] }}
              >
                {formatHourLabel(hour)}
              </div>
            ))}
          </div>

          {days.map((day) => {
            const dayIso = toISODate(day);
            return (
              <DayColumn
                key={dayIso}
                date={day}
                isToday={dayIso === today}
                calendarEvents={eventsByDay.get(dayIso) ?? EMPTY_EVENTS}
                rowLayout={rowLayout}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
