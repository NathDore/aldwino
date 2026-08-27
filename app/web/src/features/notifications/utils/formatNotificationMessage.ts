import type { AssignmentDto } from "@/features/assignments";
import type { CourseDto } from "@/features/courses";
import type { WorkSessionDto } from "@/features/workSessions";
import type { NotificationDto } from "../types/notification.types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MISSING_MESSAGE = "This item is no longer available.";

function daysBetween(from: Date, to: Date): number {
  const fromMidnight = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const toMidnight = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((toMidnight.getTime() - fromMidnight.getTime()) / MS_PER_DAY);
}

function formatWasDuePhrase(dueDate: string): string {
  const days = daysBetween(new Date(dueDate), new Date());
  if (days <= 0) return "was due today";
  if (days === 1) return "was due 1 day ago";
  return `was due ${days} days ago`;
}

function formatDueInPhrase(dueDate: string): string {
  const days = daysBetween(new Date(), new Date(dueDate));
  if (days <= 0) return "is due today";
  if (days === 1) return "is due in 1 day";
  return `is due in ${days} days`;
}

function formatSessionTimeRange(startTime: string, endTime: string): string {
  const startLabel = new Date(startTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const endLabel = new Date(endTime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${startLabel}–${endLabel}`;
}

function formatWeekday(dateIso: string): string {
  return new Date(dateIso).toLocaleDateString(undefined, { weekday: "long" });
}

export interface NotificationViewContext {
  assignments: AssignmentDto[];
  courses: CourseDto[];
  workSessions: WorkSessionDto[];
  isAssignmentsLoading: boolean;
  isWorkSessionsLoading: boolean;
}

export interface NotificationView {
  status: "loading" | "found" | "missing";
  message: string | null;
  courseColor: string | null;
}

function buildAssignmentView(notification: NotificationDto, ctx: NotificationViewContext): NotificationView {
  if (ctx.isAssignmentsLoading) {
    return { status: "loading", message: null, courseColor: null };
  }

  const assignment = ctx.assignments.find((a) => a.id === notification.entityId);
  if (!assignment) {
    return { status: "missing", message: MISSING_MESSAGE, courseColor: null };
  }

  const course = ctx.courses.find((c) => c.id === assignment.courseId);
  const phrase = notification.type === "ASSIGNMENT_OVERDUE" ? formatWasDuePhrase(assignment.dueDate) : formatDueInPhrase(assignment.dueDate);

  return {
    status: "found",
    message: `${assignment.name} ${phrase}`,
    courseColor: course?.color ?? null,
  };
}

function buildWorkSessionView(notification: NotificationDto, ctx: NotificationViewContext): NotificationView {
  if (ctx.isWorkSessionsLoading) {
    return { status: "loading", message: null, courseColor: null };
  }

  const workSession = ctx.workSessions.find((w) => w.id === notification.entityId);
  if (!workSession) {
    return { status: "missing", message: MISSING_MESSAGE, courseColor: null };
  }

  return {
    status: "found",
    message: `You skipped your ${formatSessionTimeRange(workSession.startTime, workSession.endTime)} work session on ${formatWeekday(workSession.startTime)}`,
    courseColor: null,
  };
}

export function buildNotificationView(notification: NotificationDto, ctx: NotificationViewContext): NotificationView {
  switch (notification.type) {
    case "ASSIGNMENT_OVERDUE":
    case "ASSIGNMENT_DUE_SOON":
      return buildAssignmentView(notification, ctx);
    case "WORK_SESSION_SKIPPED":
      return buildWorkSessionView(notification, ctx);
  }
}
