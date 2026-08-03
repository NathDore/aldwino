interface DayHeaderCellProps {
  date: Date;
  isToday: boolean;
}

export function DayHeaderCell({ date, isToday }: DayHeaderCellProps) {
  return (
    <div className="flex-1 min-w-[120px] border-r border-slate-200">
      <div
        className={`h-12 flex flex-col items-center justify-center ${isToday ? "bg-emerald-50" : ""}`}
      >
        <span className="text-xs text-slate-600">{date.toLocaleDateString(undefined, { weekday: "short" })}</span>
        <span className={`text-sm font-semibold ${isToday ? "text-emerald-700" : "text-slate-900"}`}>
          {date.getDate()}
        </span>
      </div>
    </div>
  );
}
