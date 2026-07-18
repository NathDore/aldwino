import { HourCell } from "./HourCell";
import { EventBlock } from "./EventBlock";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";
import { toISODate } from "../hooks/useWeekDays";
import type { RowLayout } from "../hooks/useRowLayout";
import type { CalendarEvent } from "../types/calendar.types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface DayColumnProps {
  date: Date;
  isToday: boolean;
  calendarEvents: CalendarEvent[];
  rowLayout: RowLayout;
}

export function DayColumn({ date, isToday, calendarEvents, rowLayout }: DayColumnProps) {
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

      <div className="relative transition-all duration-300 ease-in-out" style={{ height: rowLayout.totalHeight }}>
        {HOURS.map((hour) => (
          <HourCell
            key={hour}
            date={dayIso}
            hour={hour}
            top={rowLayout.rowOffsets[hour]}
            height={rowLayout.rowHeights[hour]}
          />
        ))}

        {calendarEvents.map((calendarEvent) => (
          <EventBlock key={calendarEvent.event.id} calendarEvent={calendarEvent} rowLayout={rowLayout} />
        ))}

        {isToday && <CurrentTimeIndicator rowLayout={rowLayout} />}
      </div>
    </div>
  );
}
