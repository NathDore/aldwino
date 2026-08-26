import { BellIcon } from "@/shared/components/icons";
import { useNotificationsSidebarStore } from "../store/notificationsSidebarStore";

interface NotificationBellButtonProps {
  unreadCount: number;
}

export function NotificationBellButton({ unreadCount }: NotificationBellButtonProps) {
  const isOpen = useNotificationsSidebarStore((state) => state.isOpen);
  const toggle = useNotificationsSidebarStore((state) => state.toggle);

  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Notifications"
      aria-pressed={isOpen}
      className={`relative w-9 h-9 flex items-center justify-center rounded-md transition-colors ${
        isOpen ? "bg-slate-200 text-slate-900" : "text-slate-700 hover:bg-slate-100"
      }`}
    >
      <BellIcon className="w-[18px] h-[18px]" />
      {unreadCount > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-semibold leading-4 text-center ring-2 ring-white">
          {badgeLabel}
        </span>
      )}
    </button>
  );
}
