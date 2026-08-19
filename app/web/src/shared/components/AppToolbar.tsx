import { NavLink } from "react-router-dom";
import { AddMenu } from "./AddMenu";

const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
    isActive ? "bg-emerald-50 text-emerald-700 font-semibold" : "text-slate-700 hover:bg-slate-100"
  }`;

export function AppToolbar() {
  return (
    <div className="h-16 shrink-0 flex items-center justify-between gap-2 px-3 sm:px-8 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-2 sm:gap-7 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-600" aria-hidden="true" />
          <span className="text-base font-bold text-slate-900">aldwino</span>
        </div>
        <nav className="flex items-center gap-1 min-w-0">
          <NavLink to="/calendar" className={navLinkClassName}>
            Calendar
          </NavLink>
          <NavLink to="/manage" className={navLinkClassName}>
            Manage
          </NavLink>
        </nav>
      </div>

      <AddMenu />
    </div>
  );
}
