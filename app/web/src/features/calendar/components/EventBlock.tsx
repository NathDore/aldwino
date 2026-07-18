import { useSlotPosition } from "../hooks/useSlotPosition";
import { AssignmentBlock } from "./AssignmentBlock";
import type { CalendarEvent } from "../types/calendar.types";

interface EventBlockProps {
  calendarEvent: CalendarEvent;
}

function formatTimeRange(startTime: string, endTime: string): string {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${new Date(startTime).toLocaleTimeString(undefined, opts)} – ${new Date(endTime).toLocaleTimeString(
    undefined,
    opts
  )}`;
}

export function EventBlock({ calendarEvent }: EventBlockProps) {
  const { event, assignments } = calendarEvent;
  const { topPx, heightPx } = useSlotPosition(event.startTime, event.endTime);

  return (
    <div
      className="absolute left-1 right-1 bg-white border border-slate-300 rounded shadow-sm overflow-y-auto p-1.5 space-y-1 z-10"
      style={{ top: topPx, height: Math.max(heightPx, 28) }}
    >
      <p className="text-xs font-semibold text-slate-900">{formatTimeRange(event.startTime, event.endTime)}</p>
      {assignments.map((item) => (
        <AssignmentBlock key={item.assignment.id} item={item} />
      ))}
    </div>
  );
}
