import { memo, type KeyboardEvent } from "react";
import { useCalendarStore } from "../store/calendarStore";
import { CreateWorkSessionPopover } from "@/features/workSessions/components/CreateWorkSessionPopover";

interface HourCellProps {
  date: string;
  hour: number;
  top: number;
  height: number;
  disabled: boolean;
  isCurrentHour: boolean;
}

export const HourCell = memo(function HourCell({ date, hour, top, height, disabled, isCurrentHour }: HourCellProps) {
  const creatingWorkSessionAt = useCalendarStore((s) => s.creatingWorkSessionAt);
  const startCreatingWorkSession = useCalendarStore((s) => s.startCreatingWorkSession);
  const stopCreatingWorkSession = useCalendarStore((s) => s.stopCreatingWorkSession);
  const isCreating = creatingWorkSessionAt?.date === date && creatingWorkSessionAt?.hour === hour;

  const handleStartCreating = () => {
    if (disabled) return;
    startCreatingWorkSession(date, hour, isCurrentHour);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleStartCreating();
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={handleStartCreating}
      onKeyDown={handleKeyDown}
      className={`absolute left-0 right-0 border-b border-slate-200 transition-colors focus:outline-none ${disabled
          ? "bg-slate-100 cursor-default"
          : "cursor-pointer hover:bg-slate-50 focus-visible:bg-slate-50"
        }`}
      style={{ top, height }}
    >
      {isCreating && (
        <CreateWorkSessionPopover
          date={date}
          hour={hour}
          useCurrentTimeAsStart={creatingWorkSessionAt?.useCurrentTimeAsStart}
          onClose={stopCreatingWorkSession}
        />
      )}
    </div>
  );
});
