import type { NotificationDto } from "../types/notification.types";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

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

export function formatNotificationMessage(notification: NotificationDto): string {
  switch (notification.type) {
    case "OVERDUE_ASSIGNMENT":
      return `${notification.assignmentName} ${formatWasDuePhrase(notification.dueDate)}`;
    case "UPCOMING_DEADLINE":
      return `${notification.assignmentName} ${formatDueInPhrase(notification.dueDate)}`;
    case "SKIPPED_WORK_SESSION":
      return `You skipped your ${formatSessionTimeRange(notification.startTime, notification.endTime)} work session on ${formatWeekday(notification.startTime)}`;
  }
}
