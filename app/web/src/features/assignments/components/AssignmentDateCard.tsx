import { parseISODate } from "@/features/calendar/hooks/useWeekDays";

interface AssignmentDateCardProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function AssignmentDateCard({ id, value, onChange, disabled = false }: AssignmentDateCardProps) {
  const day = value ? parseISODate(value) : null;

  return (
    <div className="relative h-[38px] w-12 shrink-0">
      <div
        className={`flex h-full w-full flex-row items-center justify-center gap-1 rounded border transition-colors ${
          day ? "bg-white border-slate-300" : "bg-slate-50 border-dashed border-slate-300"
        }`}
      >
        {day ? (
          <>
            <p className="text-[9px] leading-tight text-slate-600">
              {day.toLocaleDateString(undefined, { weekday: "short" })}
            </p>
            <p className="text-xs font-semibold leading-tight text-slate-900">{day.getDate()}</p>
          </>
        ) : (
          <p className="text-xs font-semibold leading-tight text-slate-400">–</p>
        )}
      </div>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.currentTarget.showPicker?.()}
        disabled={disabled}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
    </div>
  );
}
