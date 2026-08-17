import { useState } from "react";
import { Popover } from "@/shared/components/Popover";
import { Modal } from "@/shared/components/Modal";
import { DeleteConfirmation } from "@/shared/components/DeleteConfirmation";
import { Button } from "@/shared/components/Button";
import { RescheduleIcon, TrashIcon } from "@/features/calendar/components/icons";
import { useWorkSessionStatesQuery } from "../queries/useWorkSessionStatesQuery";
import { useChangeWorkSessionStateMutation, useDeleteWorkSessionMutation } from "../queries/useWorkSessionMutations";
import { LinkedAssignmentsList } from "./LinkedAssignmentsList";
import { LinkAssignmentPicker } from "./LinkAssignmentPicker";
import { RescheduleWorkSessionModal } from "./RescheduleWorkSessionModal";
import { CreateAssignmentForm } from "@/features/assignments/components/CreateAssignmentForm";
import type { AssignmentDto } from "@/features/assignments";
import type { CalendarWorkSession } from "@/features/calendar/types/calendar.types";
import { MODAL_HEIGHT, MODAL_WIDTH } from "@/shared/lib/formConstants";

interface WorkSessionPopoverProps {
  calendarWorkSession: CalendarWorkSession;
  onClose: () => void;
}

type Mode = "session" | "create-assignment";

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
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [mode, setMode] = useState<Mode>("session");
  const [pendingAssignmentId, setPendingAssignmentId] = useState<string | undefined>(undefined);

  const handleAssignmentCreated = (assignment: AssignmentDto) => {
    setPendingAssignmentId(assignment.id);
    setMode("session");
  };

  const stateName = workSessionStates?.find((s) => s.id === workSession.workSessionStateId)?.state;
  const isCompleted = workSession.completedAt !== null;

  const handleMarkComplete = async () => {
    const completedId = workSessionStates?.find((s) => s.state === "COMPLETED")?.id;
    if (!completedId) return;
    await stateMutation.mutateAsync({ id: workSession.id, workSessionStateId: completedId });
  };

  return (
    <Popover
      onClose={onClose}
      panelClassName="max-w-full max-h-full"
      panelStyle={{ width: MODAL_WIDTH, height: MODAL_HEIGHT }}
      headerClassName="px-10 py-3"
      header={
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
      }
    >
      {(handleClose) => {
        const handleDelete = async () => {
          await deleteMutation.mutateAsync(workSession.id);
          handleClose();
        };

        return (
          <>
            <div className="px-10 py-4 overflow-hidden min-h-0 flex-1">
              <div className="grid h-full">
                <div
                  className={`col-start-1 row-start-1 h-full overflow-y-auto min-h-0 styled-scrollbar space-y-4 ${mode === "create-assignment" ? "invisible" : ""}`}
                >
                  <LinkedAssignmentsList workSessionId={workSession.id} />
                  <LinkAssignmentPicker
                    workSessionId={workSession.id}
                    onRequestCreateAssignment={() => setMode("create-assignment")}
                    pendingAssignmentId={pendingAssignmentId}
                  />

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
                {mode === "create-assignment" && (
                  <div className="col-start-1 row-start-1 h-full">
                    <CreateAssignmentForm onCreated={handleAssignmentCreated} onBack={() => setMode("session")} />
                  </div>
                )}
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
          </>
        );
      }}
    </Popover>
  );
}
