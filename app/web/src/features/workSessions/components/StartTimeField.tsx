import { useEffect, useState } from "react";
import { DateCard } from "@/shared/components/DateCard";
import { LABEL_FONT_SIZE } from "@/shared/lib/formConstants";
import {
  appendDigit,
  backspaceDigit,
  EMPTY_TIME_DIGITS,
  formatDigits,
  formatTime12h,
  from24Hour,
  parseDigits,
  to24Hour,
  type Period,
  type TimeDigits,
} from "@/shared/lib/timeDigits";

const QUICK_OFFSETS_MINUTES = [0, 30, 60, 90];
const MINUTES_PER_DAY = 24 * 60;

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function addMinutes(time24: string, offset: number): string {
  const [hh, mm] = time24.split(":").map(Number);
  const total = ((hh * 60 + mm + offset) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

function formatChipLabel(time24: string): string {
  const [hh, mm] = time24.split(":").map(Number);
  return formatTime12h(hh, mm);
}

interface StartTimeFieldProps {
  id: string;
  dateValue: string;
  timeValue: string;
  quickTimeBase: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  dateError?: string;
  timeError?: string;
  disabled?: boolean;
  min?: string;
}

export function StartTimeField({
  id,
  dateValue,
  timeValue,
  quickTimeBase,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
  disabled = false,
  min,
}: StartTimeFieldProps) {
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

  const chipBase = (() => {
    if (!quickTimeBase) return null;
    const [hh, mm] = quickTimeBase.split(":").map(Number);
    const hour12 = hh % 12 === 0 ? 12 : hh % 12;
    return to24Hour(hour12, mm, period);
  })();
  const chipTimes = chipBase ? QUICK_OFFSETS_MINUTES.map((offset) => addMinutes(chipBase, offset)) : [];

  return (
    <div>
      <label htmlFor={id} className={`block ${LABEL_FONT_SIZE} font-semibold text-slate-700 mb-1.5`}>
        Start time
      </label>

      <div className="mb-2">
        <DateCard id={id} value={dateValue} onChange={onDateChange} disabled={disabled} min={min} />
      </div>

      <div className="flex items-center gap-1.5">
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
        <div className="flex h-[38px] rounded-md border border-slate-200 overflow-hidden">
          <button
            type="button"
            onClick={() => selectPeriod("AM")}
            disabled={disabled}
            className={`px-3 text-xs font-medium transition-colors disabled:opacity-50 ${
              period === "AM" ? "bg-emerald-50 text-emerald-700" : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => selectPeriod("PM")}
            disabled={disabled}
            className={`px-3 text-xs font-medium border-l border-slate-200 transition-colors disabled:opacity-50 ${
              period === "PM" ? "bg-emerald-50 text-emerald-700" : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            PM
          </button>
        </div>
      </div>

      {chipTimes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {chipTimes.map((time24) => {
            const isSelected = timeValue === time24;
            return (
              <button
                key={time24}
                type="button"
                onClick={() => onTimeChange(time24)}
                disabled={disabled}
                className={`h-[30px] px-3 rounded-md text-xs transition-colors disabled:opacity-50 ${
                  isSelected
                    ? "border border-emerald-600 bg-emerald-50 text-emerald-700 font-medium"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {formatChipLabel(time24)}
              </button>
            );
          })}
        </div>
      )}

      {dateError && <p className="text-red-600 text-xs mt-1">{dateError}</p>}
      {timeError && <p className="text-red-600 text-xs mt-1">{timeError}</p>}
    </div>
  );
}
