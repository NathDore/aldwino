import { memo, type KeyboardEvent } from "react";
import { useCalendarStore } from "../store/calendarStore";
import { CreateAssignmentPopover } from "@/features/assignments/components/CreateAssignmentPopover";

interface HourCellProps {
  date: string;
  hour: number;
  top: number;
  height: number;
}

export const HourCell = memo(function HourCell({ date, hour, top, height }: HourCellProps) {
  const creatingAssignmentAt = useCalendarStore((s) => s.creatingAssignmentAt);
  const startCreatingAssignment = useCalendarStore((s) => s.startCreatingAssignment);
  const stopCreatingAssignment = useCalendarStore((s) => s.stopCreatingAssignment);
  const isCreating = creatingAssignmentAt?.date === date && creatingAssignmentAt?.hour === hour;

  const handleClick = () => {
    startCreatingAssignment(date, hour);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      startCreatingAssignment(date, hour);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="absolute left-0 right-0 border-b border-slate-200 cursor-pointer transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50"
      style={{ top, height }}
    >
      {isCreating && (
        <CreateAssignmentPopover date={date} hour={hour} onClose={stopCreatingAssignment} />
      )}
    </div>
  );
});
