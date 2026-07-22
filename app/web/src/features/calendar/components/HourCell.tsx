import { memo } from "react";
import { useEventStore } from "@/features/events";
import { useCalendarStore } from "../store/calendarStore";

interface HourCellProps {
  date: string;
  hour: number;
  top: number;
  height: number;
}

export const HourCell = memo(function HourCell({ date, hour, top, height }: HourCellProps) {
  const setSelectedSlot = useCalendarStore((s) => s.setSelectedSlot);
  const { openFormForNew } = useEventStore();

  const handleClick = () => {
    setSelectedSlot(date, hour);
    openFormForNew();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Add event on ${date} at ${hour}:00`}
      className="absolute left-0 right-0 border-b border-slate-200 hover:bg-slate-50"
      style={{ top, height }}
    />
  );
});
