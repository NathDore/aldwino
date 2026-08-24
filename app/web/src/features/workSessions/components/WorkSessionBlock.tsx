import { memo, useRef } from "react";
import { useSlotPosition } from "@/features/calendar/hooks/useSlotPosition";
import type { RowLayout } from "@/features/calendar/hooks/useRowLayout";
import { useFittingAssignments } from "@/features/calendar/hooks/useFittingAssignments";
import { useFittingChips } from "@/features/calendar/hooks/useFittingChips";
import { useIsEventActive } from "@/features/calendar/hooks/useIsEventActive";
import { useCalendarStore } from "@/features/calendar/store/calendarStore";
import { AssignmentChip } from "@/features/assignments/components/AssignmentChip";
import { getCourseColor } from "@/features/assignments/utils/assignmentStatus";
import { CheckIcon } from "@/features/calendar/components/icons";
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

function AssignmentRow({ item, textColorClass }: { item: CalendarAssignment; textColorClass: string }) {
  const isCompleted = item.assignment.completedAt !== null;
  return (
    <div className={`flex items-center gap-1.5 min-w-0 w-full ${item.workedOn ? "opacity-50" : ""}`}>
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: getCourseColor(item.course) }}
        aria-hidden="true"
      />
      <p
        className={`truncate text-xs font-medium min-w-0 flex-1 ${textColorClass} ${item.workedOn ? "line-through" : ""}`}
        title={item.assignment.name}
      >
        {item.assignment.name}
      </p>
      {isCompleted && (
        <span className="inline-flex shrink-0 items-center gap-0.5 rounded text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.5">
          <CheckIcon className="w-2 h-2" />
          Done
        </span>
      )}
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
  const stateName = workSessionStates?.find((s) => s.id === workSession.workSessionStateId)?.state;
  const isSkipped = stateName === "SKIPPED";
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const chipRowRef = useRef<HTMLDivElement>(null);
  const overflowChipRowRef = useRef<HTMLDivElement>(null);
  const { getItemRef, visibleCount } = useFittingAssignments(containerRef, headerRef, assignments.length);
  const { visibleCount: visibleChipCount } = useFittingChips(chipRowRef, assignments.length);

  const hiddenCount = Math.max(assignments.length - visibleCount, 0);
  const hiddenAssignments = assignments.slice(visibleCount);
  const { visibleCount: visibleOverflowCount } = useFittingChips(overflowChipRowRef, hiddenAssignments.length, {
    chipSizePx: 14,
    gapPx: 4,
    indicatorWidthPx: 16,
  });
  const durationMinutes = getEventDurationMinutes(workSession.startTime, workSession.endTime);
  const isCompact = durationMinutes < COMPACT_EVENT_THRESHOLD_MINUTES;
  const isSingleCompactAssignment =
    assignments.length === 1 && durationMinutes <= SINGLE_ASSIGNMENT_COMPACT_THRESHOLD_MINUTES;
  const hasAssignments = assignments.length > 0;

  const statusAccentClass = isCompleted ? "border-l-emerald-500" : isSkipped ? "border-l-amber-500" : "border-l-slate-400";
  const statusTextClass = "text-slate-900";
  const headerTextClass = isCompleted ? "text-emerald-600" : isSkipped ? "text-amber-700" : "text-slate-700";

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
        <p className={`truncate text-[10px] font-medium w-full ${headerTextClass}`}>
          {formatTimeRange(workSession.startTime, workSession.endTime)}
        </p>
      ) : isSingleCompactAssignment ? (
        <AssignmentRow item={assignments[0]} textColorClass={statusTextClass} />
      ) : isCompact ? (
        <div ref={chipRowRef} className="flex w-full items-center gap-1 overflow-hidden">
          {assignments.slice(0, visibleChipCount).map((item) => (
            <AssignmentChip key={item.assignment.id} item={item} />
          ))}
          {visibleChipCount < assignments.length && (
            <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 px-1 text-[10px] font-semibold text-slate-500">
              +{assignments.length - visibleChipCount}
            </span>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          <div ref={headerRef} className="flex items-center justify-between gap-1">
            <p className={`text-[11px] font-semibold truncate ${headerTextClass}`}>
              {formatTimeRange(workSession.startTime, workSession.endTime)}
            </p>
          </div>
          {assignments.map((item, index) => (
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
              {hiddenAssignments.slice(0, visibleOverflowCount).map((hiddenItem) => (
                <AssignmentChip key={hiddenItem.assignment.id} item={hiddenItem} size="sm" />
              ))}
              {visibleOverflowCount < hiddenAssignments.length && (
                <span className="inline-flex h-3.5 min-w-3.5 shrink-0 items-center justify-center rounded-full bg-slate-100 px-1 text-[8px] font-semibold text-slate-500">
                  +{hiddenAssignments.length - visibleOverflowCount}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {isExpanded && <WorkSessionPopover calendarWorkSession={calendarWorkSession} onClose={handleClose} />}
    </div>
  );
});
