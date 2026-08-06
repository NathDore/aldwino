import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { DeleteConfirmation } from "@/shared/components/DeleteConfirmation";
import { useBodyScrollLock } from "@/shared/hooks/useBodyScrollLock";
import { CloseIcon, RescheduleIcon, TrashIcon } from "@/features/calendar/components/icons";
import { useWorkSessionStatesQuery } from "../queries/useWorkSessionStatesQuery";
import { useChangeWorkSessionStateMutation, useDeleteWorkSessionMutation } from "../queries/useWorkSessionMutations";
import { LinkedAssignmentsList } from "./LinkedAssignmentsList";
import { LinkAssignmentPicker } from "./LinkAssignmentPicker";
import { RescheduleWorkSessionModal } from "./RescheduleWorkSessionModal";
import type { CalendarWorkSession } from "@/features/calendar/types/calendar.types";

const EXIT_TRANSITION_MS = 150;
const EXIT_SAFETY_MARGIN_MS = 100;

interface WorkSessionPopoverProps {
  calendarWorkSession: CalendarWorkSession;
  onClose: () => void;
}

function formatTimeRange(startTime: string, endTime: string): string {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  return `${new Date(startTime).toLocaleTimeString(undefined, opts)} – ${new Date(endTime).toLocaleTimeString(undefined, opts)}`;
}

function formatDateHeading(startTime: string): { weekday: string; date: string } {
  const d = new Date(startTime);
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "long" }),
    date: d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
  };
}

export function WorkSessionPopover({ calendarWorkSession, onClose }: WorkSessionPopoverProps) {
  const { workSession } = calendarWorkSession;
  const { weekday, date } = formatDateHeading(workSession.startTime);
  const { data: workSessionStates } = useWorkSessionStatesQuery();
  const stateMutation = useChangeWorkSessionStateMutation();
  const deleteMutation = useDeleteWorkSessionMutation();
  const [isVisible, setIsVisible] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
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

  const stateName = workSessionStates?.find((s) => s.id === workSession.workSessionStateId)?.state;
  const isCompleted = workSession.completedAt !== null;

  const handleMarkComplete = async () => {
    const completedId = workSessionStates?.find((s) => s.state === "COMPLETED")?.id;
    if (!completedId) return;
    await stateMutation.mutateAsync({ id: workSession.id, workSessionStateId: completedId });
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(workSession.id);
    handleClose();
  };

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
          <div className="min-w-0 flex items-baseline gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-900 truncate">{weekday}</p>
            <p className="text-xs text-slate-600 truncate">{date}</p>
            <p className="text-xs font-semibold text-slate-900 shrink-0">
              {formatTimeRange(workSession.startTime, workSession.endTime)}
            </p>
            {stateName === "SKIPPED" && (
              <span className="inline-flex items-center gap-1 shrink-0 text-xs font-semibold text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" aria-hidden="true" />
                Skipped
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1 shrink-0 text-xs font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true" />
                Completed
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <span className="sr-only">Close</span>
            <CloseIcon />
          </Button>
        </div>

        <div className="space-y-4 px-6 py-4 overflow-y-auto min-h-0 styled-scrollbar">
          <LinkedAssignmentsList workSessionId={workSession.id} />
          <LinkAssignmentPicker workSessionId={workSession.id} />

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={handleMarkComplete}
                disabled={isCompleted || stateMutation.isPending}
                className="cursor-pointer disabled:cursor-not-allowed"
              />
              Mark session complete
            </label>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRescheduling(true)}
                disabled={isCompleted}
              >
                <RescheduleIcon />
                <span className="sr-only">Reschedule session</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsConfirmingDelete(true)}>
                <TrashIcon />
                <span className="sr-only">Delete session</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isRescheduling && (
        <RescheduleWorkSessionModal workSession={workSession} onClose={() => setIsRescheduling(false)} />
      )}
      {isConfirmingDelete && (
        <Modal maxWidth="max-w-md">
          <DeleteConfirmation
            title="Delete work session"
            description="This will permanently delete this session. Linked assignments will be unlinked but not deleted."
            isLoading={deleteMutation.isPending}
            onConfirm={handleDelete}
            onCancel={() => setIsConfirmingDelete(false)}
          />
        </Modal>
      )}
    </div>,
    document.body
  );
}
