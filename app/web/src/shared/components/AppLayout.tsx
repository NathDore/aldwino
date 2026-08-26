import { Outlet } from "react-router-dom";
import { AppToolbar } from "./AppToolbar";
import { NotificationSidebar } from "@/features/notifications/components/NotificationSidebar";

export function AppLayout() {
  return (
    <div className="h-screen flex flex-col">
      <AppToolbar />
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
      <NotificationSidebar />
    </div>
  );
}
