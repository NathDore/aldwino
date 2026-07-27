interface DurationSelectorProps {
  durations: readonly number[];
  selectedMinutes: number;
  onSelect: (minutes: number) => void;
  disabled?: boolean;
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DurationSelector({ durations, selectedMinutes, onSelect, disabled = false }: DurationSelectorProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-1.5 p-0.5">
      {durations.map((minutes) => {
        const isSelected = minutes === selectedMinutes;

        return (
          <button
            key={minutes}
            type="button"
            onClick={() => onSelect(minutes)}
            disabled={disabled}
            title={`${minutes} minutes`}
            className={`flex flex-col items-center gap-0.5 rounded border p-1 transition-colors disabled:opacity-50 ${
              isSelected ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-slate-400 ${
                isSelected ? "bg-emerald-600" : "bg-slate-400"
              }`}
            >
              <ClockIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <span
              className={`w-full truncate text-center text-[9px] leading-tight ${
                isSelected ? "font-medium text-emerald-700" : "text-slate-600"
              }`}
            >
              {minutes} min
            </span>
          </button>
        );
      })}
    </div>
  );
}
