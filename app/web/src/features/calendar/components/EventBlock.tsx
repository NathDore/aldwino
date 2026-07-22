import { Fragment, memo, useRef } from "react";
import { useSlotPosition } from "../hooks/useSlotPosition";
import type { RowLayout } from "../hooks/useRowLayout";
import { useFittingAssignments } from "../hooks/useFittingAssignments";
import { useIsEventActive } from "../hooks/useIsEventActive";
import { useCalendarStore } from "../store/calendarStore";
import { AssignmentBlock } from "./AssignmentBlock";
import { EventPopover } from "./EventPopover";
import type { CalendarEvent } from "../types/calendar.types";

interface EventBlockProps {
  calendarEvent: CalendarEvent;
  rowLayout: RowLayout;
}

function formatTimeRange(startTime: string, endTime: string): string {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${new Date(startTime).toLocaleTimeString(undefined, opts)} – ${new Date(endTime).toLocaleTimeString(
    undefined,
    opts
  )}`;
}

export const EventBlock = memo(function EventBlock({ calendarEvent, rowLayout }: EventBlockProps) {
  const { event, assignments } = calendarEvent;
  const { topPx, heightPx } = useSlotPosition(event.startTime, event.endTime, rowLayout);
  const expandedEventId = useCalendarStore((s) => s.expandedEventId);
  const expandEvent = useCalendarStore((s) => s.expandEvent);
  const collapseEvent = useCalendarStore((s) => s.collapseEvent);
  const isExpanded = expandedEventId === event.id;
  const isActive = useIsEventActive(event.startTime, event.endTime);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { getItemRef, visibleCount } = useFittingAssignments(containerRef, headerRef, assignments.length);

  const handleBlockClick = () => {
    if (isExpanded) return;
    expandEvent(event.id);
  };

  const handleClose = () => {
    collapseEvent();
  };

  return (
    <div
      ref={containerRef}
      onClick={handleBlockClick}
      className={`absolute left-1 right-1 bg-white border rounded overflow-y-hidden p-1.5 transition-[box-shadow,border-color] duration-300 ease-in-out cursor-pointer ${isExpanded ? "shadow-lg z-30 ring-2 ring-emerald-500" : "shadow-sm z-10 hover:shadow-md"
        } ${isActive ? "border-emerald-400 animate-glow" : "border-slate-300"}`}
      style={{ top: topPx, height: Math.max(heightPx, 28) }}
    >
      <div className="space-y-1">
        <div ref={headerRef} className="flex items-start justify-between gap-1">
          <p className="text-xs font-semibold text-slate-900">{formatTimeRange(event.startTime, event.endTime)}</p>
        </div>
        {assignments.map((item, index) => (
          <Fragment key={item.assignment.id}>
            {index === visibleCount && (
              <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600">
                <span className="inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-slate-200 px-1 text-slate-700">
                  +{assignments.length - visibleCount}
                </span>
                <span>more hidden</span>
              </div>
            )}
            <div
              ref={getItemRef(index)}
              className={index < visibleCount ? undefined : "invisible"}
              aria-hidden={index < visibleCount ? undefined : true}
            >
              <AssignmentBlock item={item} interactive={false} />
            </div>
          </Fragment>
        ))}
      </div>

      {isExpanded && <EventPopover calendarEvent={calendarEvent} onClose={handleClose} />}
    </div>
  );
});
