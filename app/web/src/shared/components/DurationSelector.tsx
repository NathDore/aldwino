import { useEffect, useState } from "react";
import { MAX_DURATION_MINUTES, MIN_DURATION_MINUTES, formatDurationLabel } from "@/shared/lib/dateTimeForm";

interface DurationSelectorProps {
  durations: readonly number[];
  selectedMinutes: number;
  onSelect: (minutes: number) => void;
  disabled?: boolean;
}

type Unit = "min" | "hr";

function minutesToUnitValue(minutes: number, unit: Unit): number {
  return unit === "hr" ? Math.round((minutes / 60) * 100) / 100 : minutes;
}

function unitValueToMinutes(value: number, unit: Unit): number {
  const minutes = unit === "hr" ? value * 60 : value;
  return Math.min(MAX_DURATION_MINUTES, Math.max(MIN_DURATION_MINUTES, Math.round(minutes)));
}

export function DurationSelector({ durations, selectedMinutes, onSelect, disabled = false }: DurationSelectorProps) {
  const [unit, setUnit] = useState<Unit>("min");
  const [draft, setDraft] = useState(() => String(minutesToUnitValue(selectedMinutes, "min")));

  useEffect(() => {
    setDraft(String(minutesToUnitValue(selectedMinutes, unit)));
  }, [selectedMinutes]);

  const handleValueChange = (value: string) => {
    setDraft(value);
    const parsed = Number(value);
    if (value.trim() === "" || Number.isNaN(parsed)) return;
    onSelect(unitValueToMinutes(parsed, unit));
  };

  const handleUnitChange = (nextUnit: Unit) => {
    const parsed = Number(draft);
    if (draft.trim() !== "" && !Number.isNaN(parsed)) {
      setDraft(String(minutesToUnitValue(unitValueToMinutes(parsed, unit), nextUnit)));
    }
    setUnit(nextUnit);
  };

  const handlePreset = (minutes: number) => {
    setDraft(String(minutesToUnitValue(minutes, unit)));
    onSelect(minutes);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="number"
          min={unit === "hr" ? MIN_DURATION_MINUTES / 60 : MIN_DURATION_MINUTES}
          max={unit === "hr" ? MAX_DURATION_MINUTES / 60 : MAX_DURATION_MINUTES}
          step={unit === "hr" ? 0.1 : 1}
          value={draft}
          onChange={(e) => handleValueChange(e.target.value)}
          disabled={disabled}
          className="h-[34px] w-24 rounded-md border border-slate-300 px-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none disabled:opacity-50"
        />
        <select
          value={unit}
          onChange={(e) => handleUnitChange(e.target.value as Unit)}
          disabled={disabled}
          className="h-[34px] rounded-md border border-slate-300 px-2 text-sm text-slate-700 focus:border-emerald-600 focus:outline-none disabled:opacity-50"
        >
          <option value="min">minutes</option>
          <option value="hr">hours</option>
        </select>
      </div>

      <div className="flex gap-1.5">
        {durations.map((minutes) => {
          const isSelected = minutes === selectedMinutes;

          return (
            <button
              key={minutes}
              type="button"
              onClick={() => handlePreset(minutes)}
              disabled={disabled}
              className={`flex h-[30px] flex-none items-center justify-center whitespace-nowrap rounded-md border px-3 text-xs transition-colors disabled:opacity-50 ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50 font-medium text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {formatDurationLabel(minutes)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
