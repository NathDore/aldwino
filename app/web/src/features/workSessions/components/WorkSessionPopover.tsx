import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Popover } from "@/shared/components/Popover";
import { Modal } from "@/shared/components/Modal";
import { DeleteConfirmation } from "@/shared/components/DeleteConfirmation";
import { Button } from "@/shared/components/Button";
import { CheckIcon, MoreIcon } from "@/features/calendar/components/icons";
import { useCalendarStore } from "@/features/calendar/store/calendarStore";
import { useWorkSessionStatesQuery } from "../queries/useWorkSessionStatesQuery";
import {
  useChangeWorkSessionStateMutation,
  useDeleteWorkSessionMutation,
  useWrapUpWorkSessionMutation,
} from "../queries/useWorkSessionMutations";
import { showToast } from "@/shared/store/toastStore";
import { useWorkSessionAssignmentLinksQuery } from "../queries/useAssignmentWorkSessionsQuery";
import { useWorkSessionCompletionMessageQuery } from "../queries/useWorkSessionCompletionMessageQuery";
import { FALLBACK_COMPLETION_MESSAGE } from "../constants/completionMessages";
import { LinkedAssignmentsList } from "./LinkedAssignmentsList";
import { LinkAssignmentPicker } from "./LinkAssignmentPicker";
import { WorkSessionTimeForm } from "./WorkSessionTimeForm";
import { CreateAssignmentForm } from "@/features/assignments/components/CreateAssignmentForm";
import type { AssignmentDto } from "@/features/assignments";
import type { CalendarWorkSession } from "@/features/calendar/types/calendar.types";
import { MODAL_HEIGHT, MODAL_WIDTH } from "@/shared/lib/formConstants";

interface WorkSessionPopoverProps {
  calendarWorkSession: CalendarWorkSession;
  onClose: () => void;
}

type Mode = "session" | "create-assignment" | "link-assignment" | "edit-session" | "reschedule-session";

const SKIPPED_UNCOMPLETED_MESSAGE = "You missed this one — reschedule it for a new time, or remove it for good.";

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
  const { data: links = [] } = useWorkSessionAssignmentLinksQuery(workSession.id);
  const stateMutation = useChangeWorkSessionStateMutation();
  const deleteMutation = useDeleteWorkSessionMutation();
  const wrapUpMutation = useWrapUpWorkSessionMutation();
  const goToWeekOf = useCalendarStore((s) => s.goToWeekOf);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuTriggerRef = useRef<HTMLSpanElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const [modeStack, setModeStack] = useState<Mode[]>(["session"]);
  const mode = modeStack[modeStack.length - 1];
  const [pendingAssignmentId, setPendingAssignmentId] = useState<string | undefined>(undefined);

  const pushMode = (m: Mode) => setModeStack((s) => [...s, m]);
  const popMode = () => setModeStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  const handleAssignmentCreated = (assignment: AssignmentDto) => {
    setPendingAssignmentId(assignment.id);
    popMode();
  };

  const handleSaved = (newStart: Date) => {
    onClose();
    goToWeekOf(newStart);
  };

  const stateName = workSessionStates?.find((s) => s.id === workSession.workSessionStateId)?.state;
  const isCompleted = workSession.completedAt !== null;
  const isPastDue = new Date(workSession.endTime).getTime() < Date.now();
  const isSkippedUncompleted = stateName === "SKIPPED";
  const isCompletedCurrent = isCompleted && !isPastDue;
  const isCompletedPastDue = isCompleted && isPastDue;
  const isInProgress = !isCompleted && !isSkippedUncompleted;

  const workedOnCount = links.filter((l) => l.workedOn).length;
  const totalLinked = links.length;
  const progressPercent = totalLinked > 0 ? Math.round((workedOnCount / totalLinked) * 100) : 0;

  const statusPill = isSkippedUncompleted
    ? { label: "Skipped", bg: "bg-amber-50", fg: "text-amber-700", dot: "bg-amber-500" }
    : isCompleted
      ? { label: "Completed", bg: "bg-emerald-50", fg: "text-emerald-700", dot: "bg-emerald-500" }
      : { label: "In progress", bg: "bg-slate-100", fg: "text-slate-700", dot: "bg-slate-400" };

  const { data: completionMessageData, isError: isCompletionMessageError } =
    useWorkSessionCompletionMessageQuery(isCompletedPastDue);
  const completionMessage =
    !isCompletionMessageError && completionMessageData ? completionMessageData.message : FALLBACK_COMPLETION_MESSAGE;

  const handleToggleComplete = async () => {
    const targetState = isCompleted ? "INPROGRESS" : "COMPLETED";
    const targetStateId = workSessionStates?.find((s) => s.state === targetState)?.id;
    if (!targetStateId) return;
    await stateMutation.mutateAsync({ id: workSession.id, workSessionStateId: targetStateId });
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    function updatePosition() {
      const rect = menuTriggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPosition({ top: rect.bottom + 4, left: rect.right });
    }

    updatePosition();

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (menuPanelRef.current?.contains(target) || menuTriggerRef.current?.contains(target)) return;
      setIsMenuOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMenuOpen(false);
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isMenuOpen]);

  return (
    <Popover
      onClose={onClose}
      panelClassName="max-w-full max-h-full"
      panelStyle={{ width: MODAL_WIDTH, height: MODAL_HEIGHT }}
      headerClassName="px-10 py-3"
      header={
        <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
          <div className="min-w-0 flex items-baseline gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-900 truncate">{weekday}</p>
            <p className="text-xs text-slate-600 truncate">{date}</p>
            <p className="text-xs font-semibold text-slate-900 shrink-0">
              {formatTimeRange(workSession.startTime, workSession.endTime)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusPill.bg} ${statusPill.fg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusPill.dot}`} aria-hidden="true" />
              {statusPill.label}
            </span>
            {isInProgress && (
              <span ref={menuTriggerRef} className="inline-flex shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen((v) => !v)}>
                  <span className="sr-only">More actions</span>
                  <MoreIcon />
                </Button>
              </span>
            )}
          </div>
          {isMenuOpen &&
            createPortal(
              <div
                ref={menuPanelRef}
                className="fixed z-[60] w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1"
                style={{ top: menuPosition.top, left: menuPosition.left, transform: "translateX(-100%)" }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    pushMode("edit-session");
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsConfirmingDelete(true);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>,
              document.body
            )}
        </div>
      }
    >
      {(handleClose) => {
        const handleDelete = async () => {
          await deleteMutation.mutateAsync(workSession.id);
          handleClose();
        };

        const handleWrapUp = async () => {
          try {
            await wrapUpMutation.mutateAsync(workSession.id);
            handleClose();
          } catch (error) {
            if (error instanceof Error) showToast(error.message, "error");
          }
        };

        return (
          <>
            <div className="px-10 py-4 overflow-hidden min-h-0 flex-1">
              <div className="grid h-full">
                <div
                  className={`col-start-1 row-start-1 h-full overflow-y-auto min-h-0 styled-scrollbar space-y-4 ${mode !== "session" ? "invisible" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Assignments · {totalLinked}
                    </p>
                    {isInProgress && (
                      <Button variant="ghost" size="sm" onClick={() => pushMode("link-assignment")}>
                        + Add
                      </Button>
                    )}
                  </div>
                  {totalLinked > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-600"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">
                        {workedOnCount} of {totalLinked} done
                      </span>
                    </div>
                  )}
                  <LinkedAssignmentsList workSessionId={workSession.id} canEdit={isInProgress} />

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    {isSkippedUncompleted && <p className="text-sm text-slate-600">{SKIPPED_UNCOMPLETED_MESSAGE}</p>}
                    {isCompletedPastDue && <p className="text-sm text-slate-600">{completionMessage}</p>}
                    <div className="flex items-center gap-2">
                      {isSkippedUncompleted && (
                        <>
                          <Button variant="warning" size="sm" onClick={() => pushMode("reschedule-session")}>
                            Reschedule
                          </Button>
                          <span className="text-sm text-slate-500">or</span>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setIsConfirmingDelete(true)}
                            disabled={deleteMutation.isPending}
                          >
                            Remove
                          </Button>
                        </>
                      )}
                      {isCompletedCurrent && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleToggleComplete}
                            disabled={stateMutation.isPending}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <CheckIcon className="w-3 h-3" />
                              Completed
                            </span>
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={handleWrapUp}
                            disabled={wrapUpMutation.isPending}
                          >
                            Wrap up
                          </Button>
                        </>
                      )}
                      {isCompletedPastDue && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={handleWrapUp}
                          disabled={wrapUpMutation.isPending}
                        >
                          Wrap up
                        </Button>
                      )}
                      {isInProgress && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleToggleComplete}
                          disabled={stateMutation.isPending}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <CheckIcon className="w-3 h-3" />
                            Complete
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                {mode === "create-assignment" && (
                  <div className="col-start-1 row-start-1 h-full">
                    <CreateAssignmentForm onCreated={handleAssignmentCreated} onBack={popMode} />
                  </div>
                )}
                {mode === "link-assignment" && (
                  <div className="col-start-1 row-start-1 h-full">
                    <LinkAssignmentPicker
                      workSessionId={workSession.id}
                      onRequestCreateAssignment={() => pushMode("create-assignment")}
                      onBack={popMode}
                      pendingAssignmentId={pendingAssignmentId}
                    />
                  </div>
                )}
                {mode === "edit-session" && (
                  <div className="col-start-1 row-start-1 h-full">
                    <WorkSessionTimeForm workSession={workSession} mode="edit" onClose={popMode} onSaved={handleSaved} />
                  </div>
                )}
                {mode === "reschedule-session" && (
                  <div className="col-start-1 row-start-1 h-full">
                    <WorkSessionTimeForm
                      workSession={workSession}
                      mode="reschedule"
                      onClose={popMode}
                      onSaved={handleSaved}
                    />
                  </div>
                )}
              </div>
            </div>

            {isConfirmingDelete && (
              <Modal maxWidth="max-w-md">
                <DeleteConfirmation
                  title="Delete work session"
                  description={
                    links.length > 0
                      ? "This will permanently delete this session. Linked assignments will be unlinked but not deleted."
                      : "This will permanently delete this session."
                  }
                  isLoading={deleteMutation.isPending}
                  onConfirm={handleDelete}
                  onCancel={() => setIsConfirmingDelete(false)}
                />
              </Modal>
            )}
          </>
        );
      }}
    </Popover>
  );
}
