import { useCalendarStore } from "../store/calendarStore";
import { useWeekDays, toISODate } from "../hooks/useWeekDays";
import { HOUR_ROW_HEIGHT } from "../hooks/useSlotPosition";
import { DayColumn } from "./DayColumn";
import type { CalendarEvent } from "../types/calendar.types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHourLabel(hour: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
}

interface WeekGridProps {
  calendarEvents: CalendarEvent[];
}

export function WeekGrid({ calendarEvents }: WeekGridProps) {
  const { currentWeekStart } = useCalendarStore();
  const days = useWeekDays(currentWeekStart);
  const today = toISODate(new Date());

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <div className="flex min-w-[900px]">
        <div className="w-16 shrink-0 border-r border-slate-200">
          <div className="h-12 border-b border-slate-200" />
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="border-b border-slate-200 text-xs text-slate-600 pr-2 pt-1 text-right"
              style={{ height: HOUR_ROW_HEIGHT }}
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
              calendarEvents={calendarEvents.filter(
                (calendarEvent) => toISODate(new Date(calendarEvent.event.startTime)) === dayIso
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
