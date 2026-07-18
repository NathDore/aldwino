import { useEventStore } from "@/features/events";
import { useCalendarStore } from "../store/calendarStore";
import { HOUR_ROW_HEIGHT } from "../hooks/useSlotPosition";

interface HourCellProps {
  date: string;
  hour: number;
}

export function HourCell({ date, hour }: HourCellProps) {
  const { setSelectedSlot } = useCalendarStore();
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
      className="absolute left-0 right-0 border-b border-slate-200 hover:bg-slate-50 transition-colors"
      style={{ top: hour * HOUR_ROW_HEIGHT, height: HOUR_ROW_HEIGHT }}
    />
  );
}
