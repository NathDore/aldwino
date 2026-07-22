import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/components/Button";
import { AssignmentBlock } from "./AssignmentBlock";
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

export function EventPopover({ calendarEvent, onClose }: EventPopoverProps) {
  const { event, assignments } = calendarEvent;
  const [isVisible, setIsVisible] = useState(false);
  const hasClosedRef = useRef(false);

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

  const handleBackdropClick = (e: MouseEvent) => {
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
      onClick={handleBackdropClick}
    >
      <div
        className={`flex flex-col w-96 max-w-full max-h-[80vh] bg-white border border-slate-200 rounded-lg shadow-lg transition-[opacity,transform] duration-150 ease-out ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        onClick={stopClickPropagation}
        onTransitionEnd={(e) => {
          if (!isVisible && e.propertyName === "opacity") closeNow();
        }}
      >
        <div className="flex items-start justify-between gap-2 p-6 pb-3 shrink-0">
          <p className="text-sm font-semibold text-slate-900">{formatTimeRange(event.startTime, event.endTime)}</p>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <span className="sr-only">Close</span>
            <CloseIcon />
          </Button>
        </div>

        <div className="space-y-2 px-6 pb-6 overflow-y-auto min-h-0">
          {assignments.map((item, index) => (
            <AssignmentBlock key={item.assignment.id} item={item} forceExpanded autoExpand={index === 0} interactive />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
