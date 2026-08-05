import { memo } from "react";
import { HourCell } from "./HourCell";
import { EventBlock } from "@/features/events/components/EventBlock";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";
import { toISODate } from "../hooks/useWeekDays";
import { useCurrentHour } from "../hooks/useCurrentHour";
import type { RowLayout } from "../hooks/useRowLayout";
import type { CalendarEvent } from "../types/calendar.types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface DayColumnProps {
  date: Date;
  isToday: boolean;
  isPastDay: boolean;
  calendarEvents: CalendarEvent[];
  rowLayout: RowLayout;
}

export const DayColumn = memo(function DayColumn({ date, isToday, isPastDay, calendarEvents, rowLayout }: DayColumnProps) {
  const dayIso = toISODate(date);
  const currentHour = useCurrentHour();

  return (
    <div className="flex-1 min-w-[120px] border-r border-slate-200">
      <div className="relative" style={{ height: rowLayout.totalHeight }}>
        {HOURS.map((hour) => {
          const isCurrentHour = isToday && hour === currentHour;
          const isPastHour = isPastDay || (isToday && hour < currentHour);
          return (
            <HourCell
              key={hour}
              date={dayIso}
              hour={hour}
              top={rowLayout.rowOffsets[hour]}
              height={rowLayout.rowHeights[hour]}
              disabled={isPastHour}
              isCurrentHour={isCurrentHour}
            />
          );
        })}

        {calendarEvents.map((calendarEvent) => (
          <EventBlock key={calendarEvent.event.id} calendarEvent={calendarEvent} rowLayout={rowLayout} />
        ))}

        {isToday && <CurrentTimeIndicator rowLayout={rowLayout} />}
      </div>
    </div>
  );
});
