import { memo, useRef } from "react";
import { useSlotPosition } from "@/features/calendar/hooks/useSlotPosition";
import type { RowLayout } from "@/features/calendar/hooks/useRowLayout";
import { useFittingAssignments } from "@/features/calendar/hooks/useFittingAssignments";
import { useFittingChips } from "@/features/calendar/hooks/useFittingChips";
import { useIsEventActive } from "@/features/calendar/hooks/useIsEventActive";
import { useCalendarStore } from "@/features/calendar/store/calendarStore";
import { AssignmentChip } from "@/features/assignments/components/AssignmentChip";
import { getCourseColor, isAssignmentCompleted } from "@/features/assignments/utils/assignmentStatus";
import { WorkSessionPopover } from "./WorkSessionPopover";
import { useWorkSessionStatesQuery } from "../queries/useWorkSessionStatesQuery";
import {
  COMPACT_EVENT_THRESHOLD_MINUTES,
  SINGLE_ASSIGNMENT_COMPACT_THRESHOLD_MINUTES,
  getEventDurationMinutes,
} from "@/features/calendar/utils/duration";
import type { CalendarAssignment, CalendarWorkSession } from "@/features/calendar/types/calendar.types";

interface WorkSessionBlockProps {
  calendarWorkSession: CalendarWorkSession;
  rowLayout: RowLayout;
}

function formatTimeRange(startTime: string, endTime: string): string {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${new Date(startTime).toLocaleTimeString(undefined, opts)} – ${new Date(endTime).toLocaleTimeString(undefined, opts)}`;
}

function CompletedStatusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#10b981" />
      <path d="M6 10.2l2.6 2.6L14.5 7" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SkippedStatusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#f59e0b" />
      <path d="M10 6v5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="14" r="1" fill="white" />
    </svg>
  );
}

function AssignmentRow({ item, textColorClass }: { item: CalendarAssignment; textColorClass: string }) {
  const completed = isAssignmentCompleted(item.assignment);
  return (
    <div className="flex items-center gap-1.5 min-w-0 w-full">
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: getCourseColor(item.course) }}
        aria-hidden="true"
      />
      <p
        className={`truncate text-xs font-medium min-w-0 ${textColorClass} ${completed ? "opacity-60 line-through" : ""}`}
        title={item.assignment.name}
      >
        {item.assignment.name}
      </p>
    </div>
  );
}

export const WorkSessionBlock = memo(function WorkSessionBlock({ calendarWorkSession, rowLayout }: WorkSessionBlockProps) {
  const { workSession, assignments } = calendarWorkSession;
  const { data: workSessionStates } = useWorkSessionStatesQuery();
  const { topPx, heightPx } = useSlotPosition(workSession.startTime, workSession.endTime, rowLayout);
  const expandedWorkSessionId = useCalendarStore((s) => s.expandedWorkSessionId);
  const expandWorkSession = useCalendarStore((s) => s.expandWorkSession);
  const collapseWorkSession = useCalendarStore((s) => s.collapseWorkSession);
  const isExpanded = expandedWorkSessionId === workSession.id;
  const isActive = useIsEventActive(workSession.startTime, workSession.endTime);
  const isCompleted = workSession.completedAt !== null;
  const isPastDue = new Date(workSession.endTime).getTime() < Date.now();
  const isCompletedOverdue = isCompleted && isPastDue;
  const stateName = workSessionStates?.find((s) => s.id === workSession.workSessionStateId)?.state;
  const isSkipped = stateName === "SKIPPED";
  const displayAssignments = isCompletedOverdue
    ? assignments
    : assignments.filter((item) => !isAssignmentCompleted(item.assignment));
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const chipRowRef = useRef<HTMLDivElement>(null);
  const overflowChipRowRef = useRef<HTMLDivElement>(null);
  const incompleteChipRowRef = useRef<HTMLDivElement>(null);
  const completedChipRowRef = useRef<HTMLDivElement>(null);
  const overflowIncompleteChipRowRef = useRef<HTMLDivElement>(null);
  const overflowCompletedChipRowRef = useRef<HTMLDivElement>(null);
  const { getItemRef, visibleCount } = useFittingAssignments(containerRef, headerRef, displayAssignments.length);
  useFittingChips(chipRowRef, displayAssignments.length);

  const incompleteAssignments = displayAssignments.filter((item) => !isAssignmentCompleted(item.assignment));
  const completedAssignments = displayAssignments.filter((item) => isAssignmentCompleted(item.assignment));
  const { visibleCount: visibleIncompleteCount } = useFittingChips(incompleteChipRowRef, incompleteAssignments.length);
  const { visibleCount: visibleCompletedCount } = useFittingChips(completedChipRowRef, completedAssignments.length);

  const hiddenCount = Math.max(displayAssignments.length - visibleCount, 0);
  const hiddenAssignments = displayAssignments.slice(visibleCount);
  const hiddenIncompleteAssignments = hiddenAssignments.filter((item) => !isAssignmentCompleted(item.assignment));
  const hiddenCompletedAssignments = hiddenAssignments.filter((item) => isAssignmentCompleted(item.assignment));
  useFittingChips(overflowChipRowRef, hiddenCount, {
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
  const durationMinutes = getEventDurationMinutes(workSession.startTime, workSession.endTime);
  const isCompact = durationMinutes < COMPACT_EVENT_THRESHOLD_MINUTES;
  const isSingleCompactAssignment =
    displayAssignments.length === 1 && durationMinutes <= SINGLE_ASSIGNMENT_COMPACT_THRESHOLD_MINUTES;
  const hasAssignments = displayAssignments.length > 0;

  const statusAccentClass = isCompleted ? "border-l-emerald-500" : isSkipped ? "border-l-amber-500" : "border-l-slate-400";
  const statusTextClass = isCompleted ? "text-emerald-600" : isSkipped ? "text-amber-700" : "text-slate-900";
  const headerTextClass = isCompleted ? "text-emerald-600" : isSkipped ? "text-amber-700" : "text-slate-700";
  const StatusIcon = isCompleted ? CompletedStatusIcon : isSkipped ? SkippedStatusIcon : null;

  const handleBlockClick = () => {
    if (isExpanded) return;
    expandWorkSession(workSession.id);
  };

  const handleClose = () => {
    collapseWorkSession();
  };

  return (
    <div
      ref={containerRef}
      onClick={handleBlockClick}
      className={`absolute left-1 right-1 border border-l-[3px] border-slate-300 ${statusAccentClass} rounded overflow-hidden bg-white p-1.5 transition-[box-shadow,border-color,background-color] duration-300 ease-in-out cursor-pointer ${isExpanded ? "shadow-lg z-30 ring-2 ring-emerald-500" : "shadow-sm z-10 hover:shadow-md"
        } ${isActive ? "border-emerald-400 animate-glow" : ""
        } ${isSingleCompactAssignment || isCompact || !hasAssignments ? "flex items-center" : ""
        }`}
      style={{ top: topPx, height: Math.max(heightPx, 28) }}
    >
      {!hasAssignments ? (
        <div className="w-full flex items-center justify-between gap-1 min-w-0">
          <p className={`truncate text-[10px] font-medium ${headerTextClass}`}>
            {formatTimeRange(workSession.startTime, workSession.endTime)}
          </p>
          {StatusIcon && <StatusIcon />}
        </div>
      ) : isSingleCompactAssignment ? (
        <AssignmentRow item={displayAssignments[0]} textColorClass={statusTextClass} />
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
              <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 px-1 text-[10px] font-semibold text-slate-500">
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
              <span className="inline-flex h-3.5 min-w-3.5 shrink-0 items-center justify-center rounded-full bg-slate-100 px-1 text-[8px] font-semibold text-slate-500">
                +{completedAssignments.length - visibleCompletedCount}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <div ref={headerRef} className="flex items-center justify-between gap-1">
            <p className={`text-[11px] font-semibold truncate ${headerTextClass}`}>
              {formatTimeRange(workSession.startTime, workSession.endTime)}
            </p>
            {StatusIcon && <StatusIcon />}
          </div>
          {displayAssignments.map((item, index) => (
            <div
              key={item.assignment.id}
              ref={getItemRef(index)}
              className={index < visibleCount ? undefined : "invisible"}
              aria-hidden={index < visibleCount ? undefined : true}
            >
              <AssignmentRow item={item} textColorClass={statusTextClass} />
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
                  <span className="inline-flex h-3.5 min-w-3.5 shrink-0 items-center justify-center rounded-full bg-slate-100 px-1 text-[8px] font-semibold text-slate-500">
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
                  <span className="inline-flex h-3.5 min-w-3.5 shrink-0 items-center justify-center rounded-full bg-slate-100 px-1 text-[8px] font-semibold text-slate-500">
                    +{hiddenCompletedAssignments.length - visibleOverflowCompletedCount}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {isExpanded && <WorkSessionPopover calendarWorkSession={calendarWorkSession} onClose={handleClose} />}
    </div>
  );
});
