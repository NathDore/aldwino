import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { mockNotifications } from "../mock/mockNotifications";
import { useNotificationsSidebarStore } from "../store/notificationsSidebarStore";
import { NotificationCard } from "./NotificationCard";

const TRANSITION_MS = 200;

export function NotificationSidebar() {
  const isOpen = useNotificationsSidebarStore((state) => state.isOpen);
  const toggle = useNotificationsSidebarStore((state) => state.toggle);

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const frame = requestAnimationFrame(() => setIsVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setIsVisible(false);
    const timer = setTimeout(() => setShouldRender(false), TRANSITION_MS);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!shouldRender) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) toggle();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shouldRender, isOpen, toggle]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className={`fixed inset-y-0 right-0 z-50 w-96 bg-white border-l border-slate-200 shadow-lg flex flex-col transition-transform duration-200 ease-out ${
        isVisible ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="px-6 py-5 border-b border-slate-200 shrink-0">
        <h1 className="text-xl font-bold text-slate-900">Notifications</h1>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {mockNotifications.length === 0 ? (
          <p className="text-center py-16 text-slate-600 text-sm">No notifications right now.</p>
        ) : (
          mockNotifications.map((notification) => <NotificationCard key={notification.id} notification={notification} />)
        )}
      </div>
    </div>,
    document.body
  );
}
