import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/components/Button";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";
import { AssignmentPopoverItem } from "./AssignmentPopoverItem";
import { CloseIcon } from "./icons";
import type { CalendarEvent } from "../types/calendar.types";

const EXIT_TRANSITION_MS = 150;
const EXIT_SAFETY_MARGIN_MS = 100;

interface EventPopoverProps {
  calendarEvent: CalendarEvent;
  onClose: () => void;
}

function formatTimeRange(startTime: string, endTime: string): string {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${new Date(startTime).toLocaleTimeString(undefined, opts)} – ${new Date(endTime).toLocaleTimeString(
    undefined,
    opts
  )}`;
}

function formatEventDateHeading(startTime: string): { weekday: string; date: string } {
  const d = new Date(startTime);
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "long" }),
    date: d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
  };
}

export function EventPopover({ calendarEvent, onClose }: EventPopoverProps) {
  const { event, assignments } = calendarEvent;
  const sortedAssignments = useMemo(
    () => [...assignments].sort((a, b) => Number(a.assignment.isCompleted) - Number(b.assignment.isCompleted)),
    [assignments]
  );
  const { weekday, date } = formatEventDateHeading(event.startTime);
  const [isVisible, setIsVisible] = useState(false);
  const hasClosedRef = useRef(false);
  const mouseDownOnBackdropRef = useRef(false);

  useBodyScrollLock();

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const closeNow = useCallback(() => {
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;
    onClose();
  }, [onClose]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    window.setTimeout(closeNow, EXIT_TRANSITION_MS + EXIT_SAFETY_MARGIN_MS);
  }, [closeNow]);

  const handleBackdropMouseDown = (e: MouseEvent) => {
    mouseDownOnBackdropRef.current = e.target === e.currentTarget;
  };

  const handleBackdropClick = (e: MouseEvent) => {
    const shouldClose = mouseDownOnBackdropRef.current && e.target === e.currentTarget;
    mouseDownOnBackdropRef.current = false;
    if (!shouldClose) return;
    e.stopPropagation();
    handleClose();
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose]);

  const stopClickPropagation = (e: MouseEvent) => e.stopPropagation();

  return createPortal(
    <div
      className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 transition-opacity duration-150 ease-out ${isVisible ? "opacity-100" : "opacity-0"
        }`}
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
    >
      <div
        className={`flex flex-col w-[30rem] max-w-full max-h-[80vh] bg-white border border-slate-200 rounded-lg shadow-lg transition-[opacity,transform] duration-150 ease-out ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        onClick={stopClickPropagation}
        onTransitionEnd={(e) => {
          if (!isVisible && e.propertyName === "opacity") closeNow();
        }}
      >
        <div className="flex items-start justify-between gap-2 px-6 py-3 border-b border-slate-200 shrink-0">
          <div className="min-w-0 flex items-baseline gap-2">
            <p className="text-sm font-bold text-slate-900 truncate">{weekday}</p>
            <p className="text-xs text-slate-600 truncate">{date}</p>
            <p className="text-xs font-semibold text-slate-900 shrink-0">
              {formatTimeRange(event.startTime, event.endTime)}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <span className="sr-only">Close</span>
            <CloseIcon />
          </Button>
        </div>

        <div className="space-y-3 px-6 py-4 overflow-y-auto min-h-0">
          {sortedAssignments.map((item) => (
            <AssignmentPopoverItem key={item.assignment.id} item={item} />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
