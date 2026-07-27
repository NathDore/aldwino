import { useEffect, useState, type ReactNode } from "react";

export const TIME_FORMAT_ERROR = "Enter a time as HH:MM";

export function isValidTimeFormat(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

type Period = "AM" | "PM";

const TWO_DIGIT_HOURS = ["10", "11", "12"];

// Builds up a raw "HMM"/"HHMM" digit buffer one character at a time, rejecting
// any digit that could never lead to a valid 12-hour time (e.g. a minutes-tens
// digit above 5), so an invalid time can't be typed in the first place.
function appendDigit(digits: string, ch: string): string {
  if (!/^[0-9]$/.test(ch)) return digits;

  if (digits.length === 0) {
    return ch === "0" ? digits : ch;
  }

  if (digits.length === 1) {
    if (digits !== "1") {
      return Number(ch) > 5 ? digits : digits + ch;
    }
    if (ch === "0" || ch === "1" || ch === "2") {
      return digits + ch;
    }
    return Number(ch) > 5 ? digits : digits + ch;
  }

  const hourWidth = TWO_DIGIT_HOURS.includes(digits.slice(0, 2)) ? 2 : 1;

  if (digits.length === hourWidth) {
    return Number(ch) > 5 ? digits : digits + ch;
  }

  if (digits.length === hourWidth + 1) {
    return digits + ch;
  }

  return digits;
}

function formatDigits(digits: string): string {
  if (digits.length === 0) return "";
  if (digits.length === 1) return digits;
  const hourWidth = TWO_DIGIT_HOURS.includes(digits.slice(0, 2)) ? 2 : 1;
  const hourPart = digits.slice(0, hourWidth);
  const minutePart = digits.slice(hourWidth);
  return minutePart.length === 0 ? `${hourPart}:` : `${hourPart}:${minutePart}`;
}

function parseDigits(digits: string): { hour12: number; minute: number } | null {
  if (digits.length < 3) return null;
  const hourWidth = TWO_DIGIT_HOURS.includes(digits.slice(0, 2)) ? 2 : 1;
  if (digits.length !== hourWidth + 2) return null;
  const hour12 = Number(digits.slice(0, hourWidth));
  const minute = Number(digits.slice(hourWidth));
  if (hour12 < 1 || hour12 > 12 || minute > 59) return null;
  return { hour12, minute };
}

function to24Hour(hour12: number, minute: number, period: Period): string {
  const hour24 = period === "PM" ? (hour12 % 12) + 12 : hour12 % 12;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hour24)}:${pad(minute)}`;
}

function from24Hour(time24: string): { digits: string; period: Period } | null {
  if (!isValidTimeFormat(time24)) return null;
  const [hh, mm] = time24.split(":").map(Number);
  const period: Period = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  return { digits: `${hour12}${mm.toString().padStart(2, "0")}`, period };
}

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
  renderDateInput?: (props: {
    id: string;
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
  }) => ReactNode;
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
  renderDateInput,
}: DateTimeFieldProps) {
  const [digits, setDigits] = useState("");
  const [period, setPeriod] = useState<Period>("AM");

  useEffect(() => {
    const parsed = from24Hour(timeValue);
    setDigits(parsed?.digits ?? "");
    setPeriod(parsed?.period ?? "AM");
  }, [timeValue]);

  const commit = (nextDigits: string, nextPeriod: Period) => {
    const parsed = parseDigits(nextDigits);
    onTimeChange(parsed ? to24Hour(parsed.hour12, parsed.minute, nextPeriod) : "");
  };

  const handleTimeInputChange = (raw: string) => {
    const rawDigits = raw.replace(/\D/g, "");
    let nextDigits: string;
    if (rawDigits.length === digits.length + 1 && rawDigits.startsWith(digits)) {
      nextDigits = appendDigit(digits, rawDigits[rawDigits.length - 1]);
    } else {
      nextDigits = "";
      for (const ch of rawDigits) {
        nextDigits = appendDigit(nextDigits, ch);
      }
    }
    setDigits(nextDigits);
    commit(nextDigits, period);
  };

  const handleBackspace = () => {
    const nextDigits = digits.slice(0, -1);
    setDigits(nextDigits);
    commit(nextDigits, period);
  };

  const selectPeriod = (nextPeriod: Period) => {
    setPeriod(nextPeriod);
    commit(digits, nextPeriod);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-900 mb-1">
        {label}
      </label>
      <div className="flex items-end gap-1.5">
        {renderDateInput ? (
          renderDateInput({ id, value: dateValue, onChange: onDateChange, disabled })
        ) : (
          <input
            id={id}
            type="date"
            value={dateValue}
            onChange={(e) => onDateChange(e.target.value)}
            className={`w-32 shrink-0 px-2 py-1.5 text-sm bg-white border text-slate-900 focus:outline-none transition-colors ${
              dateError ? "border-red-500 focus:border-red-600" : "border-slate-300 focus:border-emerald-600"
            }`}
            disabled={disabled}
          />
        )}
        <input
          id={`${id}-time`}
          type="text"
          value={formatDigits(digits)}
          onChange={(e) => handleTimeInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              handleBackspace();
            }
          }}
          placeholder="HH:MM"
          inputMode="numeric"
          className={`h-12 w-20 shrink-0 px-3 text-sm bg-white border text-slate-900 placeholder-slate-500 focus:outline-none transition-colors ${
            timeError ? "border-red-500 focus:border-red-600" : "border-slate-300 focus:border-emerald-600"
          }`}
          disabled={disabled}
        />
        <div className="flex h-12 w-10 shrink-0 flex-col gap-0.5">
          <button
            type="button"
            onClick={() => selectPeriod("AM")}
            disabled={disabled}
            className={`flex-1 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
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
            className={`flex-1 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
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
