import { Outlet } from "react-router-dom";
import { AppToolbar } from "./AppToolbar";

export function AppLayout() {
  return (
    <div className="h-screen flex flex-col">
      <AppToolbar />
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  );
}
