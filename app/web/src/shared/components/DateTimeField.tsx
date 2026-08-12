import { useEffect, useState } from "react";
import { DateCard } from "@/shared/components/DateCard";
import { LABEL_FONT_SIZE } from "@/shared/lib/formConstants";
import {
  appendDigit,
  backspaceDigit,
  EMPTY_TIME_DIGITS,
  formatDigits,
  from24Hour,
  isValidTimeFormat,
  parseDigits,
  TIME_FORMAT_ERROR,
  to24Hour,
  type Period,
  type TimeDigits,
} from "@/shared/lib/timeDigits";

export { TIME_FORMAT_ERROR, isValidTimeFormat };

interface DateTimeFieldProps {
  label: string;
  id: string;
  dateValue: string;
  timeValue: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  dateError?: string;
  timeError?: string;
  disabled?: boolean;
  min?: string;
}

export function DateTimeField({
  label,
  id,
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
  disabled = false,
  min,
}: DateTimeFieldProps) {
  const [entry, setEntry] = useState<TimeDigits>(EMPTY_TIME_DIGITS);
  const [period, setPeriod] = useState<Period>("AM");

  useEffect(() => {
    const parsed = from24Hour(timeValue);
    setEntry(parsed?.state ?? EMPTY_TIME_DIGITS);
    setPeriod(parsed?.period ?? "AM");
  }, [timeValue]);

  const commit = (nextEntry: TimeDigits, nextPeriod: Period) => {
    const parsed = parseDigits(nextEntry);
    onTimeChange(parsed ? to24Hour(parsed.hour12, parsed.minute, nextPeriod) : "");
  };

  const handleTimeInputChange = (raw: string) => {
    const rawDigits = raw.replace(/\D/g, "");
    let nextEntry: TimeDigits;
    if (rawDigits.length === entry.digits.length + 1 && rawDigits.startsWith(entry.digits)) {
      nextEntry = appendDigit(entry, rawDigits[rawDigits.length - 1]);
    } else {
      nextEntry = EMPTY_TIME_DIGITS;
      for (const ch of rawDigits) {
        nextEntry = appendDigit(nextEntry, ch);
      }
    }
    setEntry(nextEntry);
    commit(nextEntry, period);
  };

  const handleBackspace = () => {
    const nextEntry = backspaceDigit(entry);
    setEntry(nextEntry);
    commit(nextEntry, period);
  };

  const selectPeriod = (nextPeriod: Period) => {
    setPeriod(nextPeriod);
    commit(entry, nextPeriod);
  };

  return (
    <div>
      <label htmlFor={id} className={`block ${LABEL_FONT_SIZE} font-semibold text-slate-700 mb-1.5`}>
        {label}
      </label>
      <div className="flex items-end gap-1.5">
        <DateCard id={id} value={dateValue} onChange={onDateChange} disabled={disabled} min={min} />
        <input
          id={`${id}-time`}
          type="text"
          value={formatDigits(entry)}
          onChange={(e) => handleTimeInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              handleBackspace();
            }
          }}
          placeholder="HH:MM"
          inputMode="numeric"
          className={`h-[38px] w-16 shrink-0 px-2 text-xs bg-white border text-slate-900 placeholder-slate-500 focus:outline-none transition-colors ${
            timeError ? "border-red-500 focus:border-red-600" : "border-slate-300 focus:border-emerald-600"
          }`}
          disabled={disabled}
        />
        <div className="flex h-[38px] w-8 shrink-0 flex-col gap-0.5">
          <button
            type="button"
            onClick={() => selectPeriod("AM")}
            disabled={disabled}
            className={`flex-1 rounded text-[9px] font-medium transition-colors disabled:opacity-50 ${
              period === "AM"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => selectPeriod("PM")}
            disabled={disabled}
            className={`flex-1 rounded text-[9px] font-medium transition-colors disabled:opacity-50 ${
              period === "PM"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-200 text-slate-900 hover:bg-slate-300"
            }`}
          >
            PM
          </button>
        </div>
      </div>
      {dateError && <p className="text-red-600 text-xs mt-1">{dateError}</p>}
      {timeError && <p className="text-red-600 text-xs mt-1">{timeError}</p>}
    </div>
  );
}
