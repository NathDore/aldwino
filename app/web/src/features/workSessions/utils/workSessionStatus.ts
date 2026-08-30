import type { WorkSessionDto, WorkSessionStateDto, WorkSessionStateName } from "../types/workSession.types";
import type { AssignmentWorkSessionDto } from "../types/assignmentWorkSession.types";

export function getWorkSessionStateName(
  workSession: WorkSessionDto,
  workSessionStates: WorkSessionStateDto[] | undefined
): WorkSessionStateName | undefined {
  return workSessionStates?.find((s) => s.id === workSession.workSessionStateId)?.state;
}

export function isWorkSessionCompleted(workSession: WorkSessionDto): boolean {
  return workSession.completedAt !== null;
}

export function isWorkSessionPastDue(workSession: WorkSessionDto, now: Date = new Date()): boolean {
  return new Date(workSession.endTime).getTime() < now.getTime();
}

export function isWorkSessionWaitConfirm(stateName: WorkSessionStateName | undefined): boolean {
  return stateName === "WAIT_CONFIRM";
}

export function isWorkSessionSkipped(stateName: WorkSessionStateName | undefined): boolean {
  return stateName === "SKIPPED";
}

export interface WorkSessionStatusPill {
  label: string;
  bg: string;
  fg: string;
  dot: string;
}

export interface WorkSessionLifecycle {
  stateName: WorkSessionStateName | undefined;
  isCompleted: boolean;
  isPastDue: boolean;
  isWaitConfirm: boolean;
  isSkipped: boolean;
  isCompletedCurrent: boolean;
  isCompletedPastDue: boolean;
  isInProgress: boolean;
  statusPill: WorkSessionStatusPill;
}

export function deriveWorkSessionLifecycle(
  workSession: WorkSessionDto,
  workSessionStates: WorkSessionStateDto[] | undefined,
  now: Date = new Date()
): WorkSessionLifecycle {
  const stateName = getWorkSessionStateName(workSession, workSessionStates);
  const isCompleted = isWorkSessionCompleted(workSession);
  const isPastDue = isWorkSessionPastDue(workSession, now);
  const isWaitConfirm = isWorkSessionWaitConfirm(stateName);
  const isSkipped = isWorkSessionSkipped(stateName);
  const isCompletedCurrent = isCompleted && !isPastDue;
  const isCompletedPastDue = isCompleted && isPastDue;
  const isInProgress = !isCompleted && !isWaitConfirm && !isSkipped;

  const statusPill: WorkSessionStatusPill = isSkipped
    ? { label: "Skipped", bg: "bg-amber-50", fg: "text-amber-700", dot: "bg-amber-500" }
    : isWaitConfirm
      ? { label: "Needs confirmation", bg: "bg-amber-50", fg: "text-amber-700", dot: "bg-amber-500" }
      : isCompleted
        ? { label: "Completed", bg: "bg-emerald-50", fg: "text-emerald-700", dot: "bg-emerald-500" }
        : { label: "In progress", bg: "bg-slate-100", fg: "text-slate-700", dot: "bg-slate-400" };

  return {
    stateName,
    isCompleted,
    isPastDue,
    isWaitConfirm,
    isSkipped,
    isCompletedCurrent,
    isCompletedPastDue,
    isInProgress,
    statusPill,
  };
}

export interface WorkSessionLinkProgress {
  workedOnCount: number;
  totalLinked: number;
  progressPercent: number;
}

export function computeWorkSessionLinkProgress(links: AssignmentWorkSessionDto[]): WorkSessionLinkProgress {
  const workedOnCount = links.filter((l) => l.workedOn).length;
  const totalLinked = links.length;
  const progressPercent = totalLinked > 0 ? Math.round((workedOnCount / totalLinked) * 100) : 0;
  return { workedOnCount, totalLinked, progressPercent };
}
