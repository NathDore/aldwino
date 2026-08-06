import { memo } from "react";
import { HourCell } from "./HourCell";
import { WorkSessionBlock } from "@/features/workSessions/components/WorkSessionBlock";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";
import { toISODate } from "../hooks/useWeekDays";
import { useCurrentHour } from "../hooks/useCurrentHour";
import type { RowLayout } from "../hooks/useRowLayout";
import type { CalendarWorkSession } from "../types/calendar.types";

const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface DayColumnProps {
  date: Date;
  isToday: boolean;
  isPastDay: boolean;
  calendarWorkSessions: CalendarWorkSession[];
  rowLayout: RowLayout;
}

export const DayColumn = memo(function DayColumn({ date, isToday, isPastDay, calendarWorkSessions, rowLayout }: DayColumnProps) {
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

        {calendarWorkSessions.map((calendarWorkSession) => (
          <WorkSessionBlock
            key={calendarWorkSession.workSession.id}
            calendarWorkSession={calendarWorkSession}
            rowLayout={rowLayout}
          />
        ))}

        {isToday && <CurrentTimeIndicator rowLayout={rowLayout} />}
      </div>
    </div>
  );
});
