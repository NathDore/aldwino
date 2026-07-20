import { Fragment, useLayoutEffect, useRef, type MouseEvent } from "react";
import { useSlotPosition } from "../hooks/useSlotPosition";
import type { RowLayout } from "../hooks/useRowLayout";
import { useFittingAssignments } from "../hooks/useFittingAssignments";
import { useCalendarStore } from "../store/calendarStore";
import { AssignmentBlock } from "./AssignmentBlock";
import { CloseIcon } from "./icons";
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

export function EventBlock({ calendarEvent, rowLayout }: EventBlockProps) {
  const { event, assignments } = calendarEvent;
  const { topPx, heightPx } = useSlotPosition(event.startTime, event.endTime, rowLayout);
  const { expandedEventId, expandEvent, collapseEvent, setExpandedEventContentHeight } = useCalendarStore();
  const isExpanded = expandedEventId === event.id;
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const { getItemRef, visibleCount } = useFittingAssignments(containerRef, headerRef, assignments.length, [
    isExpanded,
  ]);

  useLayoutEffect(() => {
    if (!isExpanded) return;
    const el = contentRef.current;
    if (!el) return;

    const measure = () => setExpandedEventContentHeight(el.scrollHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isExpanded, setExpandedEventContentHeight]);

  const handleBlockClick = () => {
    if (!isExpanded) {
      expandEvent(event.id);
    }
  };

  const handleClose = (e: MouseEvent) => {
    e.stopPropagation();
    collapseEvent();
  };

  return (
    <div
      ref={containerRef}
      data-event-block-id={event.id}
      onClick={handleBlockClick}
      className={`absolute left-1 right-1 bg-white border border-slate-300 rounded overflow-y-hidden p-1.5 transition-all duration-300 ease-in-out cursor-pointer ${isExpanded ? "shadow-lg z-30" : "shadow-sm z-10 hover:shadow-md"
        }`}
      style={{ top: topPx, height: Math.max(heightPx, 28) }}
    >
      <div ref={contentRef} className="space-y-1">
        <div ref={headerRef} className="flex items-start justify-between gap-1">
          <p className="text-xs font-semibold text-slate-900">{formatTimeRange(event.startTime, event.endTime)}</p>
          {isExpanded && (
            <button
              type="button"
              onClick={handleClose}
              className="text-slate-600 hover:text-slate-900 shrink-0"
              aria-label="Close event"
            >
              <CloseIcon />
            </button>
          )}
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
              <AssignmentBlock item={item} forceExpanded={isExpanded} autoExpand={index === 0} />
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
