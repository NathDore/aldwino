import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/components/Button";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";
import { AssignmentFormPanel } from "./AssignmentFormPanel";
import { CloseIcon } from "@/features/calendar/components/icons";
import { parseISODate } from "@/features/calendar/hooks/useWeekDays";
import { useAssignmentFormSize } from "@/features/calendar/store/calendarStore";

const EXIT_TRANSITION_MS = 150;
const EXIT_SAFETY_MARGIN_MS = 100;

interface CreateAssignmentPopoverProps {
  date: string;
  hour: number;
  onClose: () => void;
}

function formatHourLabel(hour: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
}

function formatHeading(date: string): { weekday: string; dateLabel: string } {
  const d = parseISODate(date);
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "long" }),
    dateLabel: d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
  };
}

export function CreateAssignmentPopover({ date, hour, onClose }: CreateAssignmentPopoverProps) {
  const { weekday, dateLabel } = formatHeading(date);
  const formSize = useAssignmentFormSize();
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
  const stopKeyDownPropagation = (e: ReactKeyboardEvent) => e.stopPropagation();

  return createPortal(
    <div
      className={`fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 transition-opacity duration-150 ease-out ${isVisible ? "opacity-100" : "opacity-0"
        }`}
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
      onKeyDown={stopKeyDownPropagation}
    >
      <div
        className={`flex flex-col max-w-full bg-white border border-slate-200 rounded-lg shadow-lg transition-[opacity,transform] duration-150 ease-out ${formSize ? "" : "w-[34rem] max-h-[80vh]"} ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        style={formSize ? { width: formSize.width, height: formSize.height } : undefined}
        onClick={stopClickPropagation}
        onTransitionEnd={(e) => {
          if (!isVisible && e.propertyName === "opacity") closeNow();
        }}
      >
        <div className="flex items-start justify-between gap-2 px-10 py-3 border-b border-slate-200 shrink-0">
          <div className="min-w-0 flex items-baseline gap-2">
            <p className="text-sm font-bold text-slate-900 truncate">{weekday}</p>
            <p className="text-xs text-slate-600 truncate">{dateLabel}</p>
            <p className="text-xs font-semibold text-slate-900 shrink-0">{formatHourLabel(hour)}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <span className="sr-only">Close</span>
            <CloseIcon />
          </Button>
        </div>

        <div className="px-10 py-4 overflow-hidden min-h-0">
          <AssignmentFormPanel date={date} hour={hour} onClose={handleClose} />
        </div>
      </div>
    </div>,
    document.body
  );
}
