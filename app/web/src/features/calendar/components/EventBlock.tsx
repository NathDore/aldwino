import { memo, useRef } from "react";
import { useSlotPosition } from "../hooks/useSlotPosition";
import type { RowLayout } from "../hooks/useRowLayout";
import { useFittingAssignments } from "../hooks/useFittingAssignments";
import { useFittingChips } from "../hooks/useFittingChips";
import { useIsEventActive } from "../hooks/useIsEventActive";
import { useCalendarStore } from "../store/calendarStore";
import { AssignmentBlock } from "@/features/assignments/components/AssignmentBlock";
import { AssignmentChip } from "@/features/assignments/components/AssignmentChip";
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
  const overflowChipRowRef = useRef<HTMLDivElement>(null);
  const incompleteChipRowRef = useRef<HTMLDivElement>(null);
  const completedChipRowRef = useRef<HTMLDivElement>(null);
  const overflowIncompleteChipRowRef = useRef<HTMLDivElement>(null);
  const overflowCompletedChipRowRef = useRef<HTMLDivElement>(null);
  const { getItemRef, visibleCount } = useFittingAssignments(containerRef, headerRef, assignments.length);
  const { visibleCount: visibleChipCount } = useFittingChips(chipRowRef, assignments.length);

  const incompleteAssignments = assignments.filter((item) => !item.assignment.isCompleted);
  const completedAssignments = assignments.filter((item) => item.assignment.isCompleted);
  const { visibleCount: visibleIncompleteCount } = useFittingChips(incompleteChipRowRef, incompleteAssignments.length);
  const { visibleCount: visibleCompletedCount } = useFittingChips(completedChipRowRef, completedAssignments.length);

  const hiddenCount = Math.max(assignments.length - visibleCount, 0);
  const hiddenAssignments = assignments.slice(visibleCount);
  const hiddenIncompleteAssignments = hiddenAssignments.filter((item) => !item.assignment.isCompleted);
  const hiddenCompletedAssignments = hiddenAssignments.filter((item) => item.assignment.isCompleted);
  const { visibleCount: visibleOverflowChipCount } = useFittingChips(overflowChipRowRef, hiddenCount, {
    chipSizePx: 14,
    gapPx: 4,
    indicatorWidthPx: 16,
  });
  const { visibleCount: visibleOverflowIncompleteCount } = useFittingChips(overflowIncompleteChipRowRef, hiddenIncompleteAssignments.length, {
    chipSizePx: 14,
    gapPx: 4,
    indicatorWidthPx: 16,
  });
  const { visibleCount: visibleOverflowCompletedCount } = useFittingChips(overflowCompletedChipRowRef, hiddenCompletedAssignments.length, {
    chipSizePx: 14,
    gapPx: 4,
    indicatorWidthPx: 16,
  });
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
        <AssignmentBlock item={assignments[0]} state="default" />
      ) : isCompact ? (
        <div ref={chipRowRef} className="flex w-full items-center gap-1 overflow-hidden">
          {/* Incomplete chips - proportional width based on count */}
          <div
            ref={incompleteChipRowRef}
            className="flex items-center gap-1 overflow-hidden"
            style={{ flex: incompleteAssignments.length || 0 }}
          >
            {incompleteAssignments.slice(0, visibleIncompleteCount).map((item) => (
              <AssignmentChip key={item.assignment.id} item={item} />
            ))}
            {visibleIncompleteCount < incompleteAssignments.length && (
              <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 px-1 text-[10px] font-medium text-slate-700">
                +{incompleteAssignments.length - visibleIncompleteCount}
              </span>
            )}
          </div>

          {/* Completed chips - proportional width based on count */}
          <div
            ref={completedChipRowRef}
            className="flex items-center gap-1 overflow-hidden justify-end"
            style={{ flex: completedAssignments.length || 0 }}
          >
            {completedAssignments.slice(0, visibleCompletedCount).map((item) => (
              <AssignmentChip key={item.assignment.id} item={item} size="sm" />
            ))}
            {visibleCompletedCount < completedAssignments.length && (
              <span className="inline-flex h-3.5 min-w-3.5 shrink-0 items-center justify-center rounded-full bg-slate-200 px-1 text-[8px] font-medium text-slate-700">
                +{completedAssignments.length - visibleCompletedCount}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <div ref={headerRef} className="flex items-start justify-between gap-1" />
          {assignments.map((item, index) => (
            <div
              key={item.assignment.id}
              ref={getItemRef(index)}
              className={index < visibleCount ? undefined : "invisible"}
              aria-hidden={index < visibleCount ? undefined : true}
            >
              <AssignmentBlock item={item} state="default" />
            </div>
          ))}
          {hiddenCount > 0 && (
            <div
              ref={overflowChipRowRef}
              className="absolute inset-x-1.5 bottom-1.5 flex items-center gap-1 overflow-hidden"
            >
              {/* Incomplete overflow chips - proportional width based on count */}
              <div
                ref={overflowIncompleteChipRowRef}
                className="flex items-center gap-1 overflow-hidden"
                style={{ flex: hiddenIncompleteAssignments.length || 0 }}
              >
                {hiddenIncompleteAssignments.slice(0, visibleOverflowIncompleteCount).map((hiddenItem) => (
                  <AssignmentChip key={hiddenItem.assignment.id} item={hiddenItem} size="sm" />
                ))}
                {visibleOverflowIncompleteCount < hiddenIncompleteAssignments.length && (
                  <span className="inline-flex h-3.5 min-w-3.5 shrink-0 items-center justify-center rounded-full bg-slate-200 px-1 text-[8px] font-medium text-slate-700">
                    +{hiddenIncompleteAssignments.length - visibleOverflowIncompleteCount}
                  </span>
                )}
              </div>

              {/* Completed overflow chips - proportional width based on count */}
              <div
                ref={overflowCompletedChipRowRef}
                className="flex items-center gap-1 overflow-hidden justify-end"
                style={{ flex: hiddenCompletedAssignments.length || 0 }}
              >
                {hiddenCompletedAssignments.slice(0, visibleOverflowCompletedCount).map((hiddenItem) => (
                  <AssignmentChip key={hiddenItem.assignment.id} item={hiddenItem} size="sm" />
                ))}
                {visibleOverflowCompletedCount < hiddenCompletedAssignments.length && (
                  <span className="inline-flex h-3.5 min-w-3.5 shrink-0 items-center justify-center rounded-full bg-slate-200 px-1 text-[8px] font-medium text-slate-700">
                    +{hiddenCompletedAssignments.length - visibleOverflowCompletedCount}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {isExpanded && <EventPopover calendarEvent={calendarEvent} onClose={handleClose} />}
    </div>
  );
});
