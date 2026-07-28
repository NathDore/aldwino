import { Fragment, memo, useRef } from "react";
import { useSlotPosition } from "../hooks/useSlotPosition";
import type { RowLayout } from "../hooks/useRowLayout";
import { useFittingAssignments } from "../hooks/useFittingAssignments";
import { useFittingChips } from "../hooks/useFittingChips";
import { useIsEventActive } from "../hooks/useIsEventActive";
import { useCalendarStore } from "../store/calendarStore";
import { AssignmentBlock } from "./AssignmentBlock";
import { CompactAssignmentChip } from "./CompactAssignmentChip";
import { CompactSingleAssignment } from "./CompactSingleAssignment";
import { EventPopover } from "./EventPopover";
import {
  COMPACT_EVENT_THRESHOLD_MINUTES,
  SINGLE_ASSIGNMENT_COMPACT_THRESHOLD_MINUTES,
  getEventDurationMinutes,
} from "../utils/duration";
import type { CalendarEvent } from "../types/calendar.types";

interface EventBlockProps {
  calendarEvent: CalendarEvent;
  rowLayout: RowLayout;
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
  const chipRowRef = useRef<HTMLDivElement>(null);
  const { getItemRef, visibleCount } = useFittingAssignments(containerRef, headerRef, assignments.length);
  const { visibleCount: visibleChipCount } = useFittingChips(chipRowRef, assignments.length);
  const durationMinutes = getEventDurationMinutes(event.startTime, event.endTime);
  const isCompact = durationMinutes < COMPACT_EVENT_THRESHOLD_MINUTES;
  const isSingleCompactAssignment =
    assignments.length === 1 && durationMinutes <= SINGLE_ASSIGNMENT_COMPACT_THRESHOLD_MINUTES;

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
        } ${isActive ? "border-emerald-400 animate-glow" : "border-slate-300"} ${isSingleCompactAssignment || isCompact ? "flex items-center" : ""
        }`}
      style={{ top: topPx, height: Math.max(heightPx, 28) }}
    >
      {isSingleCompactAssignment ? (
        <CompactSingleAssignment item={assignments[0]} />
      ) : isCompact ? (
        <div ref={chipRowRef} className="flex w-full items-center gap-1 overflow-hidden">
          {assignments.slice(0, visibleChipCount).map((item) => (
            <CompactAssignmentChip key={item.assignment.id} item={item} />
          ))}
          {visibleChipCount < assignments.length && (
            <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 px-1 text-[10px] font-medium text-slate-700">
              +{assignments.length - visibleChipCount}
            </span>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <div ref={headerRef} className="flex items-start justify-between gap-1" />
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
      )}

      {isExpanded && <EventPopover calendarEvent={calendarEvent} onClose={handleClose} />}
    </div>
  );
});
