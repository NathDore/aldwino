import { createPortal } from "react-dom";
import { Popover } from "@/shared/components/Popover";
import { Modal } from "@/shared/components/Modal";
import { DeleteConfirmation } from "@/shared/components/DeleteConfirmation";
import { Button } from "@/shared/components/Button";
import { CheckIcon, MoreIcon } from "@/features/calendar/components/icons";
import { LinkedAssignmentsList } from "./LinkedAssignmentsList";
import { LinkAssignmentPicker } from "./LinkAssignmentPicker";
import { WorkSessionTimeForm } from "./WorkSessionTimeForm";
import { CreateAssignmentForm } from "@/features/assignments/components/CreateAssignmentForm";
import type { CalendarWorkSession } from "@/features/calendar/types/calendar.types";
import { MODAL_HEIGHT, MODAL_WIDTH } from "@/shared/lib/formConstants";
import { useWorkSessionPopover, WAIT_CONFIRM_MESSAGE, SKIPPED_MESSAGE } from "../hooks/useWorkSessionPopover";
import { formatWorkSessionTimeRange } from "../utils/formatWorkSessionTime";

interface WorkSessionPopoverProps {
  calendarWorkSession: CalendarWorkSession;
  onClose: () => void;
}

export function WorkSessionPopover({ calendarWorkSession, onClose }: WorkSessionPopoverProps) {
  const {
    weekday,
    date,
    lifecycle,
    linkProgress,
    completionMessage,
    isStatesLoading,
    links,
    isLinksLoading,
    isCompletePending,
    isConfirmCompletePending,
    isConfirmSkipPending,
    isUncompletePending,
    isDeletePending,
    isWrapUpLatePending,
    isClosePending,
    isMenuOpen,
    menuPosition,
    menuTriggerRef,
    menuPanelRef,
    toggleMenu,
    closeMenu,
    isConfirmingDelete,
    setIsConfirmingDelete,
    mode,
    pushMode,
    popMode,
    pendingAssignmentId,
    handleAssignmentCreated,
    handleSaved,
    handleComplete,
    handleUncomplete,
    handleConfirmComplete,
    handleConfirmSkip,
    handleDelete,
    handleCloseSession,
    workSession,
  } = useWorkSessionPopover(calendarWorkSession, onClose);

  const { isWaitConfirm, isSkipped, isCompletedCurrent, isCompletedPastDue, isInProgress, statusPill } = lifecycle;
  const { totalLinked, workedOnCount, progressPercent } = linkProgress;

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
              {formatWorkSessionTimeRange(workSession.startTime, workSession.endTime)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isStatesLoading ? (
              <span className="inline-block h-[26px] w-24 rounded-full bg-slate-100 animate-pulse" />
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusPill.bg} ${statusPill.fg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusPill.dot}`} aria-hidden="true" />
                {statusPill.label}
              </span>
            )}
            {!isStatesLoading && isInProgress && (
              <span ref={menuTriggerRef} className="inline-flex shrink-0">
                <Button variant="ghost" size="sm" onClick={toggleMenu}>
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
                    closeMenu();
                    pushMode("edit-session");
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
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
      {(handleClose) => (
        <>
          <div className="px-10 py-4 overflow-hidden min-h-0 flex-1">
            <div className="grid h-full">
              <div
                className={`col-start-1 row-start-1 h-full overflow-y-auto min-h-0 styled-scrollbar space-y-4 ${mode !== "session" ? "invisible" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Assignments{!isLinksLoading && ` · ${totalLinked}`}
                  </p>
                  {!isStatesLoading && isInProgress && (
                    <Button variant="ghost" size="sm" onClick={() => pushMode("link-assignment")}>
                      + Add
                    </Button>
                  )}
                </div>
                {!isLinksLoading && totalLinked > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-600" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">
                      {workedOnCount} of {totalLinked} done
                    </span>
                  </div>
                )}
                <LinkedAssignmentsList workSessionId={workSession.id} canEdit={!isStatesLoading && isInProgress} />

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  {isStatesLoading ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-8 w-24 rounded-lg bg-slate-100 animate-pulse" />
                      <span className="inline-block h-8 w-24 rounded-lg bg-slate-100 animate-pulse" />
                    </div>
                  ) : (
                    <>
                      {isWaitConfirm && <p className="text-sm text-slate-600">{WAIT_CONFIRM_MESSAGE}</p>}
                      {isSkipped && <p className="text-sm text-slate-600">{SKIPPED_MESSAGE}</p>}
                      {isCompletedPastDue && <p className="text-sm text-slate-600">{completionMessage}</p>}
                      <div className="flex items-center gap-2">
                        {isWaitConfirm && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleConfirmComplete}
                              disabled={isConfirmCompletePending}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <CheckIcon className="w-3 h-3" />
                                Complete
                              </span>
                            </Button>
                            <span className="text-sm text-slate-500">or</span>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={handleConfirmSkip}
                              disabled={isConfirmSkipPending}
                            >
                              Confirm skipped
                            </Button>
                          </>
                        )}
                        {isSkipped && (
                          <>
                            <Button variant="warning" size="sm" onClick={() => pushMode("reschedule-session")}>
                              Reschedule
                            </Button>
                            <span className="text-sm text-slate-500">or</span>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setIsConfirmingDelete(true)}
                              disabled={isWrapUpLatePending}
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
                              onClick={handleUncomplete}
                              disabled={isUncompletePending}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <CheckIcon className="w-3 h-3" />
                                Completed
                              </span>
                            </Button>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleCloseSession(handleClose)}
                              disabled={isClosePending}
                            >
                              Close
                            </Button>
                          </>
                        )}
                        {isCompletedPastDue && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleCloseSession(handleClose)}
                            disabled={isClosePending}
                          >
                            Close
                          </Button>
                        )}
                        {isInProgress && (
                          <Button variant="primary" size="sm" onClick={handleComplete} disabled={isCompletePending}>
                            <span className="inline-flex items-center gap-1.5">
                              <CheckIcon className="w-3 h-3" />
                              Complete
                            </span>
                          </Button>
                        )}
                      </div>
                    </>
                  )}
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
                isLoading={isSkipped ? isWrapUpLatePending : isDeletePending}
                onConfirm={() => handleDelete(handleClose)}
                onCancel={() => setIsConfirmingDelete(false)}
              />
            </Modal>
          )}
        </>
      )}
    </Popover>
  );
}
