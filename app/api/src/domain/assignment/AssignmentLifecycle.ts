import type { Assignment } from "./Assignment";
import {
  CannotCompleteAssignmentError,
  CannotDeleteAssignmentError,
  CannotEditAssignmentError,
  CannotUncompleteAssignmentError,
  CannotLinkAssignmentError,
  CannotRescheduleAssignmentError,
  AssignmentNotCompletedError,
  AssignmentNotOverdueError,
} from "./AssignmentError";

export type AssignmentLifecycleState = "UPCOMING" | "OVERDUE" | "COMPLETED" | "COMPLETED_OVERDUE";

export function resolveLifecycle(assignment: Assignment, now: Date): AssignmentLifecycleState {
  const isCompleted = assignment.completedAt !== null;
  const isOverdue = assignment.dueDate < now;

  if (isCompleted) {
    return isOverdue ? "COMPLETED_OVERDUE" : "COMPLETED";
  }
  return isOverdue ? "OVERDUE" : "UPCOMING";
}

export function assertCanComplete(assignment: Assignment, now: Date): void {
  const state = resolveLifecycle(assignment, now);
  if (state !== "UPCOMING") {
    throw new CannotCompleteAssignmentError(state);
  }
}

export function assertCanUncomplete(assignment: Assignment, now: Date): void {
  const state = resolveLifecycle(assignment, now);
  if (state !== "COMPLETED") {
    throw new CannotUncompleteAssignmentError(state);
  }
}

export function assertCanEdit(assignment: Assignment, now: Date): void {
  const state = resolveLifecycle(assignment, now);
  if (state !== "UPCOMING") {
    throw new CannotEditAssignmentError(state);
  }
}

export function assertCanDelete(assignment: Assignment, now: Date): void {
  const state = resolveLifecycle(assignment, now);
  if (state !== "UPCOMING") {
    throw new CannotDeleteAssignmentError(state);
  }
}

export function assertCanReschedule(assignment: Assignment, now: Date): void {
  const state = resolveLifecycle(assignment, now);
  if (state !== "OVERDUE") {
    throw new CannotRescheduleAssignmentError(state);
  }
}

export function assertCanLink(assignment: Assignment, now: Date): void {
  const state = resolveLifecycle(assignment, now);
  if (state !== "UPCOMING") {
    throw new CannotLinkAssignmentError(state);
  }
}

export function assertCanWrapUp(assignment: Assignment, now: Date): void {
  const state = resolveLifecycle(assignment, now);
  if (state !== "COMPLETED" && state !== "COMPLETED_OVERDUE") {
    throw new AssignmentNotCompletedError(state);
  }
}

export function assertCanWrapUpLate(assignment: Assignment, now: Date): void {
  const state = resolveLifecycle(assignment, now);
  if (state !== "OVERDUE") {
    throw new AssignmentNotOverdueError(state);
  }
}
