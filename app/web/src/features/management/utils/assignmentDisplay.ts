import { type AssignmentDto, isAssignmentCompleted, isAssignmentOverdue } from "@/features/assignments";

export function getAssignmentStatusBadge(assignment: AssignmentDto): { label: string; className: string } {
  if (isAssignmentCompleted(assignment)) {
    return { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-300" };
  }
  if (isAssignmentOverdue(assignment)) {
    return { label: "Overdue", className: "bg-amber-50 text-amber-700 border-amber-300" };
  }
  return { label: "Upcoming", className: "bg-slate-100 text-slate-700 border-slate-200" };
}

export function formatAssignmentDueDate(dueDate: string): string {
  const d = new Date(dueDate);
  const dateLabel = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const timeLabel = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${dateLabel}, ${timeLabel}`;
}
