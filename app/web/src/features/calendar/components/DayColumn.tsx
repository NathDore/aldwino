import { HourCell } from "./HourCell";
import { EventBlock } from "./EventBlock";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";
import { toISODate } from "../hooks/useWeekDays";
import { HOUR_ROW_HEIGHT } from "../hooks/useSlotPosition";
import type { CalendarEvent } from "../types/calendar.types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface DayColumnProps {
  date: Date;
  isToday: boolean;
  calendarEvents: CalendarEvent[];
}

export function DayColumn({ date, isToday, calendarEvents }: DayColumnProps) {
  const dayIso = toISODate(date);

  return (
    <div className="flex-1 min-w-[120px] border-r border-slate-200 last:border-r-0">
      <div
        className={`h-12 border-b border-slate-200 flex flex-col items-center justify-center ${
          isToday ? "bg-emerald-50" : ""
        }`}
      >
        <span className="text-xs text-slate-600">{date.toLocaleDateString(undefined, { weekday: "short" })}</span>
        <span className={`text-sm font-semibold ${isToday ? "text-emerald-700" : "text-slate-900"}`}>
          {date.getDate()}
        </span>
      </div>

      <div className="relative" style={{ height: HOUR_ROW_HEIGHT * 24 }}>
        {HOURS.map((hour) => (
          <HourCell key={hour} date={dayIso} hour={hour} />
        ))}

        {calendarEvents.map((calendarEvent) => (
          <EventBlock key={calendarEvent.event.id} calendarEvent={calendarEvent} />
        ))}

        {isToday && <CurrentTimeIndicator />}
      </div>
    </div>
  );
}
