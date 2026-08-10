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
  const maxMinutes = Math.max(...durations);

  return (
    <div className="flex gap-1.5">
      {durations.map((minutes) => {
        const isSelected = minutes === selectedMinutes;
        // Chip width scales with duration so longer sessions read as visually "longer".
        const paddingX = Math.round(8 + (minutes / maxMinutes) * 20);

        return (
          <button
            key={minutes}
            type="button"
            onClick={() => onSelect(minutes)}
            disabled={disabled}
            title={`${minutes} minutes`}
            style={{ paddingLeft: paddingX, paddingRight: paddingX }}
            className={`flex h-[34px] flex-none items-center justify-center gap-1.5 whitespace-nowrap rounded-md border transition-colors disabled:opacity-50 ${isSelected ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
          >
            <div
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-slate-400 ${isSelected ? "bg-emerald-600" : "bg-slate-400"
                }`}
            >
              <ClockIcon className="h-2.5 w-2.5 text-white" />
            </div>
            <span className={`text-xs leading-tight ${isSelected ? "font-medium text-emerald-700" : "text-slate-600"}`}>
              {minutes}m
            </span>
          </button>
        );
      })}
    </div>
  );
}
