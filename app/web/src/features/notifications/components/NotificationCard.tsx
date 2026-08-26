import { ChevronRightIcon } from "@/shared/components/icons";
import type { NotificationDto } from "../types/notification.types";
import { formatNotificationMessage } from "../utils/formatNotificationMessage";

interface NotificationCardProps {
  notification: NotificationDto;
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const message = formatNotificationMessage(notification);
  const courseColor = notification.type !== "SKIPPED_WORK_SESSION" ? notification.courseColor : null;

  const swatch = courseColor && (
    <span className="w-2.5 h-2.5 rounded-sm mt-1 shrink-0" style={{ backgroundColor: courseColor }} aria-hidden="true" />
  );

  if (notification.type === "UPCOMING_DEADLINE") {
    return (
      <div className="flex items-start gap-3 px-6 py-4 border-b border-slate-200 text-sm text-slate-900">
        {swatch}
        <span className="flex-1 min-w-0">{message}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {}}
      className="w-full flex items-start gap-3 px-6 py-4 border-b border-slate-200 text-sm text-slate-900 text-left hover:bg-slate-50 transition-colors"
    >
      {swatch}
      <span className="flex-1 min-w-0">{message}</span>
      <ChevronRightIcon className="w-4 h-4 mt-0.5 shrink-0 text-slate-600" />
    </button>
  );
}
