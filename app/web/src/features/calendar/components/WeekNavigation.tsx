import { Button } from "@/shared/components/Button";
import { useCalendarStore } from "../store/calendarStore";
import { useWeekDays } from "../hooks/useWeekDays";

function formatWeekRange(start: Date, end: Date): string {
  const startLabel = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

export function WeekNavigation() {
  const currentWeekStart = useCalendarStore((s) => s.currentWeekStart);
  const goToPrevWeek = useCalendarStore((s) => s.goToPrevWeek);
  const goToNextWeek = useCalendarStore((s) => s.goToNextWeek);
  const goToToday = useCalendarStore((s) => s.goToToday);
  const days = useWeekDays(currentWeekStart);

  return (
    <div className="mb-4 sticky top-0 z-40 h-14 flex items-center justify-between gap-4 flex-wrap bg-white border-b border-slate-200">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={goToPrevWeek}>
          Previous
        </Button>
        <Button variant="ghost" size="sm" onClick={goToNextWeek}>
          Next
        </Button>
        <span className="text-sm font-semibold text-slate-700 ml-2">{formatWeekRange(days[0], days[6])}</span>
      </div>
      <Button variant="primary" size="sm" onClick={goToToday}>
        Today
      </Button>
    </div>
  );
}
