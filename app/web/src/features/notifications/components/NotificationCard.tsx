import { useNavigate } from "react-router-dom";
import { ChevronRightIcon } from "@/shared/components/icons";
import type { AssignmentDto } from "@/features/assignments";
import type { CourseDto } from "@/features/courses";
import type { WorkSessionDto } from "@/features/workSessions";
import type { NotificationDto } from "../types/notification.types";
import { buildNotificationView } from "../utils/formatNotificationMessage";
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
  const markAsReadMutation = useMarkNotificationReadMutation();

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
        <div className="h-4 flex-1 rounded bg-slate-100 animate-pulse" />
      </div>
    );
  }

  function handleClick() {
    markAsReadMutation.mutate(notification.id);
    navigate(`/notifications/${notification.id}`);
    if (isOpen) toggle();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-start gap-3 px-6 py-4 border-b border-slate-200 text-sm text-slate-900 text-left hover:bg-slate-50 transition-colors"
    >
      {swatch}
      <span className="flex-1 min-w-0">{view.message}</span>
      <ChevronRightIcon className="w-4 h-4 mt-0.5 shrink-0 text-slate-600" />
    </button>
  );
}
