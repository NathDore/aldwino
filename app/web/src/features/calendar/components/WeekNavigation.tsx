import { Button } from "@/shared/components/Button";
import { useCalendarStore } from "../store/calendarStore";
import { useWeekDays } from "../hooks/useWeekDays";

function formatWeekRange(start: Date, end: Date): string {
  const startLabel = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

export function WeekNavigation() {
  const { currentWeekStart, goToPrevWeek, goToNextWeek, goToToday } = useCalendarStore();
  const days = useWeekDays(currentWeekStart);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="ghost" size="sm" onClick={goToPrevWeek}>
        Previous
      </Button>
      <Button variant="secondary" size="sm" onClick={goToToday}>
        Today
      </Button>
      <Button variant="ghost" size="sm" onClick={goToNextWeek}>
        Next
      </Button>
      <span className="text-sm font-semibold text-slate-700 ml-2">{formatWeekRange(days[0], days[6])}</span>
    </div>
  );
}
