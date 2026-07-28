import { Button } from "@/shared/components/Button";
import { useWeekDays } from "@/features/calendar/hooks/useWeekDays";

interface WeekNavigationProps {
  title: string;
  weekStart: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

function formatWeekRange(start: Date, end: Date): string {
  const startLabel = start.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const endLabel = end.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${startLabel} – ${endLabel}`;
}

export function WeekNavigation({ title, weekStart, onPrevWeek, onNextWeek }: WeekNavigationProps) {
  const days = useWeekDays(weekStart);

  return (
    <div className="flex w-full items-center justify-between gap-4 flex-wrap">
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="ghost" size="sm" onClick={onPrevWeek}>
          Previous
        </Button>
        <span className="text-sm text-slate-600 min-w-[100px] text-center">
          {formatWeekRange(days[0], days[6])}
        </span>
        <Button variant="ghost" size="sm" onClick={onNextWeek}>
          Next
        </Button>
      </div>
    </div>
  );
}
