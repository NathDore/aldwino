import { useState } from "react";
import { useCalendarStore } from "@/features/calendar/store/calendarStore";
import { useAnchoredMenu } from "@/shared/hooks/useAnchoredMenu";
import { showToast } from "@/shared/store/toastStore";
import type { AssignmentDto } from "@/features/assignments";
import type { CalendarWorkSession } from "@/features/calendar/types/calendar.types";
import { useWorkSessionStatesQuery } from "../queries/useWorkSessionStatesQuery";
import { useWorkSessionAssignmentLinksQuery } from "../queries/useAssignmentWorkSessionsQuery";
import { useWorkSessionCompletionMessageQuery } from "../queries/useWorkSessionCompletionMessageQuery";
import {
  useCompleteWorkSessionMutation,
  useConfirmCompleteWorkSessionMutation,
  useConfirmSkipWorkSessionMutation,
  useUncompleteWorkSessionMutation,
  useDeleteWorkSessionMutation,
  useWrapUpLateWorkSessionMutation,
  useCloseWorkSessionMutation,
} from "../queries/useWorkSessionMutations";
import { FALLBACK_COMPLETION_MESSAGE } from "../constants/completionMessages";
import { deriveWorkSessionLifecycle, computeWorkSessionLinkProgress } from "../utils/workSessionStatus";
import { formatWorkSessionDateHeading } from "../utils/formatWorkSessionTime";

export type WorkSessionPopoverMode = "session" | "create-assignment" | "link-assignment" | "edit-session" | "reschedule-session";

export const WAIT_CONFIRM_MESSAGE = "Did you forget this one? Mark it complete, or confirm that you skipped it.";
export const SKIPPED_MESSAGE = "You skipped this one — reschedule it for a new time, or remove it for good.";

export function useWorkSessionPopover(calendarWorkSession: CalendarWorkSession, onClose: () => void) {
  const { workSession } = calendarWorkSession;
  const { weekday, date } = formatWorkSessionDateHeading(workSession.startTime);

  const { data: workSessionStates, isLoading: isStatesLoading } = useWorkSessionStatesQuery();
  const { data: links = [], isLoading: isLinksLoading } = useWorkSessionAssignmentLinksQuery(workSession.id);

  const completeMutation = useCompleteWorkSessionMutation();
  const confirmCompleteMutation = useConfirmCompleteWorkSessionMutation();
  const confirmSkipMutation = useConfirmSkipWorkSessionMutation();
  const uncompleteMutation = useUncompleteWorkSessionMutation();
  const deleteMutation = useDeleteWorkSessionMutation();
  const wrapUpLateMutation = useWrapUpLateWorkSessionMutation();
  const closeMutation = useCloseWorkSessionMutation();

  const goToWeekOf = useCalendarStore((s) => s.goToWeekOf);

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const {
    isOpen: isMenuOpen,
    position: menuPosition,
    triggerRef: menuTriggerRef,
    panelRef: menuPanelRef,
    toggle: toggleMenu,
    close: closeMenu,
  } = useAnchoredMenu<{ top: number; left: number }, HTMLSpanElement, HTMLDivElement>({
    computePosition: (rect) => ({ top: rect.bottom + 4, left: rect.right }),
  });
  const [modeStack, setModeStack] = useState<WorkSessionPopoverMode[]>(["session"]);
  const mode = modeStack[modeStack.length - 1];
  const [pendingAssignmentId, setPendingAssignmentId] = useState<string | undefined>(undefined);

  const pushMode = (m: WorkSessionPopoverMode) => setModeStack((s) => [...s, m]);
  const popMode = () => setModeStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  const handleAssignmentCreated = (assignment: AssignmentDto) => {
    setPendingAssignmentId(assignment.id);
    popMode();
  };

  const handleSaved = (newStart: Date) => {
    onClose();
    goToWeekOf(newStart);
  };

  const lifecycle = deriveWorkSessionLifecycle(workSession, workSessionStates);
  const linkProgress = computeWorkSessionLinkProgress(links);

  const { data: completionMessageData, isError: isCompletionMessageError } = useWorkSessionCompletionMessageQuery(
    lifecycle.isCompletedPastDue
  );
  const completionMessage =
    !isCompletionMessageError && completionMessageData ? completionMessageData.message : FALLBACK_COMPLETION_MESSAGE;

  const handleComplete = async () => {
    await completeMutation.mutateAsync(workSession.id);
  };

  const handleUncomplete = async () => {
    await uncompleteMutation.mutateAsync(workSession.id);
  };

  const handleConfirmComplete = async () => {
    await confirmCompleteMutation.mutateAsync(workSession.id);
  };

  const handleConfirmSkip = async () => {
    await confirmSkipMutation.mutateAsync(workSession.id);
  };

  const handleDelete = async (handleClose: () => void) => {
    if (lifecycle.isSkipped) {
      await wrapUpLateMutation.mutateAsync(workSession.id);
    } else {
      await deleteMutation.mutateAsync(workSession.id);
    }
    handleClose();
  };

  const handleCloseSession = async (handleClose: () => void) => {
    try {
      await closeMutation.mutateAsync(workSession.id);
      handleClose();
    } catch (error) {
      if (error instanceof Error) showToast(error.message, "error");
    }
  };

  return {
    weekday,
    date,
    lifecycle,
    linkProgress,
    completionMessage,

    isStatesLoading,
    links,
    isLinksLoading,

    isCompletePending: completeMutation.isPending,
    isConfirmCompletePending: confirmCompleteMutation.isPending,
    isConfirmSkipPending: confirmSkipMutation.isPending,
    isUncompletePending: uncompleteMutation.isPending,
    isDeletePending: deleteMutation.isPending,
    isWrapUpLatePending: wrapUpLateMutation.isPending,
    isClosePending: closeMutation.isPending,

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
  };
}
