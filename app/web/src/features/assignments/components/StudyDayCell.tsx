import { memo } from "react";

interface StudyDayCellProps {
  iso: string;
  day: Date;
  isToday: boolean;
  isSelected: boolean;
  onSelect: (iso: string) => void;
}

export const StudyDayCell = memo(function StudyDayCell({
  iso,
  day,
  isToday,
  isSelected,
  onSelect,
}: StudyDayCellProps) {
  return (
    <button
      onClick={() => onSelect(iso)}
      className={`relative flex flex-col items-center rounded border p-1.5 text-center transition-colors ${
        isSelected
          ? "bg-emerald-600 border-emerald-600 hover:bg-emerald-700"
          : "bg-slate-50 border-slate-200 hover:bg-slate-100"
      }`}
    >
      <p className={`text-[10px] leading-tight ${isSelected ? "text-emerald-50" : "text-slate-600"}`}>
        {day.toLocaleDateString(undefined, { weekday: "short" })}
      </p>
      <p
        className={`text-sm font-semibold leading-tight ${
          isSelected ? "text-white" : isToday ? "text-emerald-600" : "text-slate-900"
        }`}
      >
        {day.getDate()}
      </p>
    </button>
  );
});
