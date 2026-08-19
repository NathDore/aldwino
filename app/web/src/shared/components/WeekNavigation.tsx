import { Button } from "@/shared/components/Button";
import { ChevronLeftIcon, ChevronRightIcon } from "@/shared/components/icons";
import { useWeekDays } from "@/features/calendar/hooks/useWeekDays";

interface WeekNavigationProps {
  weekStart: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

function formatWeekRange(start: Date, end: Date): string {
  const startLabel = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

export function WeekNavigation({ weekStart, onPrevWeek, onNextWeek, onToday }: WeekNavigationProps) {
  const days = useWeekDays(weekStart);

  return (
    <div className="flex w-full items-center justify-end gap-4 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onToday}>
          Today
        </Button>
        <Button variant="ghost" size="sm" onClick={onPrevWeek}>
          <span className="sr-only">Previous week</span>
          <ChevronLeftIcon />
        </Button>
        <span className="text-sm text-slate-600 min-w-[100px] text-center">
          {formatWeekRange(days[0], days[6])}
        </span>
        <Button variant="ghost" size="sm" onClick={onNextWeek}>
          <span className="sr-only">Next week</span>
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
