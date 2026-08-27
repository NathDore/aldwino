import { useNavigate } from "react-router-dom";
import { ChevronRightIcon } from "@/shared/components/icons";
import type { AssignmentDto } from "@/features/assignments";
import type { CourseDto } from "@/features/courses";
import type { WorkSessionDto } from "@/features/workSessions";
import type { NotificationDto } from "../types/notification.types";
import { buildNotificationView } from "../utils/formatNotificationMessage";
import { isRemovable } from "../utils/notificationEligibility";
import { useNotificationsSidebarStore } from "../store/notificationsSidebarStore";
import { useMarkNotificationReadMutation } from "../queries/useNotificationMutations";

interface NotificationCardProps {
  notification: NotificationDto;
  assignments: AssignmentDto[];
  courses: CourseDto[];
  workSessions: WorkSessionDto[];
  isAssignmentsLoading: boolean;
  isWorkSessionsLoading: boolean;
}

export function NotificationCard({
  notification,
  assignments,
  courses,
  workSessions,
  isAssignmentsLoading,
  isWorkSessionsLoading,
}: NotificationCardProps) {
  const navigate = useNavigate();
  const isOpen = useNotificationsSidebarStore((state) => state.isOpen);
  const toggle = useNotificationsSidebarStore((state) => state.toggle);
  const isSelected = useNotificationsSidebarStore((state) => state.selectedIds.has(notification.id));
  const toggleSelected = useNotificationsSidebarStore((state) => state.toggleSelected);
  const markAsReadMutation = useMarkNotificationReadMutation();

  const removable = isRemovable(notification);

  const checkboxColumn = (
    <span className="w-4 h-4 mt-1 shrink-0 flex items-center justify-center">
      {removable && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => toggleSelected(notification.id)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select notification for removal"
          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
        />
      )}
    </span>
  );

  const view = buildNotificationView(notification, {
    assignments,
    courses,
    workSessions,
    isAssignmentsLoading,
    isWorkSessionsLoading,
  });

  const swatch = view.courseColor && (
    <span className="w-2.5 h-2.5 rounded-sm mt-1 shrink-0" style={{ backgroundColor: view.courseColor }} aria-hidden="true" />
  );

  if (view.status === "loading") {
    return (
      <div className="flex items-start gap-3 px-6 py-4 border-b border-slate-200">
        {checkboxColumn}
        <div className="h-4 flex-1 rounded bg-slate-100 animate-pulse" />
      </div>
    );
  }

  function handleClick() {
    markAsReadMutation.mutate(notification.id);
    navigate(`/notifications/${notification.id}`);
    if (isOpen) toggle();
  }

  const readStateClassName = notification.isRead
    ? "bg-white hover:bg-slate-50 font-normal"
    : "bg-slate-50 hover:bg-slate-100 font-semibold";

  return (
    <div
      className={`w-full flex items-start gap-3 px-6 py-4 border-b border-slate-200 text-sm text-slate-900 transition-colors ${readStateClassName}`}
    >
      {checkboxColumn}
      <button type="button" onClick={handleClick} className="flex-1 min-w-0 flex items-start gap-3 text-left">
        {swatch}
        <span className="flex-1 min-w-0">{view.message}</span>
        <ChevronRightIcon className="w-4 h-4 mt-0.5 shrink-0 text-slate-600" />
      </button>
    </div>
  );
}
