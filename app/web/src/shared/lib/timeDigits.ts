export type Period = "AM" | "PM";

export const TIME_FORMAT_ERROR = "Enter a time as HH:MM";

export function isValidTimeFormat(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

const TWO_DIGIT_HOURS = ["10", "11", "12"];

// A digit buffer for a 12-hour time being typed one character at a time.
// hourWidth is null while it's still ambiguous whether the hour is 1 or 2 digits
// (i.e. exactly one hour digit has been entered so far); it's locked in as soon
// as a second hour digit is typed or the buffer is set from a known value, so it
// never has to be re-guessed from content alone (see appendDigit vs. from24Hour).
export interface TimeDigits {
  digits: string;
  hourWidth: 1 | 2 | null;
}

export const EMPTY_TIME_DIGITS: TimeDigits = { digits: "", hourWidth: null };

// Builds up the digit buffer one character at a time, rejecting any digit that
// could never lead to a valid 12-hour time (e.g. a minutes-tens digit above 5),
// so an invalid time can't be typed in the first place.
export function appendDigit(state: TimeDigits, ch: string): TimeDigits {
  if (!/^[0-9]$/.test(ch)) return state;
  const { digits, hourWidth } = state;

  if (digits.length === 0) {
    return ch === "0" ? state : { digits: ch, hourWidth: null };
  }

  if (hourWidth === null) {
    // Exactly one hour digit so far. If it's "1", the next digit might extend
    // it to a two-digit hour (10/11/12) or might be the first minute digit.
    if (digits !== "1") {
      return Number(ch) > 5 ? state : { digits: digits + ch, hourWidth: 1 };
    }
    if (ch === "0" || ch === "1" || ch === "2") {
      return { digits: digits + ch, hourWidth: 2 };
    }
    return Number(ch) > 5 ? state : { digits: digits + ch, hourWidth: 1 };
  }

  const minuteDigitsSoFar = digits.length - hourWidth;

  if (minuteDigitsSoFar === 0) {
    return Number(ch) > 5 ? state : { digits: digits + ch, hourWidth };
  }

  if (minuteDigitsSoFar === 1) {
    return { digits: digits + ch, hourWidth };
  }

  return state;
}

export function backspaceDigit(state: TimeDigits): TimeDigits {
  const digits = state.digits.slice(0, -1);
  if (digits.length === 0) return EMPTY_TIME_DIGITS;
  // Backspacing down to a single hour digit makes the hour width ambiguous again.
  if (digits.length === 1) return { digits, hourWidth: null };
  return { digits, hourWidth: state.hourWidth };
}

export function formatDigits({ digits, hourWidth }: TimeDigits): string {
  if (digits.length === 0) return "";
  if (digits.length === 1) return digits;
  const width = hourWidth ?? (TWO_DIGIT_HOURS.includes(digits.slice(0, 2)) ? 2 : 1);
  const hourPart = digits.slice(0, width);
  const minutePart = digits.slice(width);
  return minutePart.length === 0 ? `${hourPart}:` : `${hourPart}:${minutePart}`;
}

export function parseDigits({ digits, hourWidth }: TimeDigits): { hour12: number; minute: number } | null {
  if (digits.length < 3) return null;
  const width = hourWidth ?? (TWO_DIGIT_HOURS.includes(digits.slice(0, 2)) ? 2 : 1);
  if (digits.length !== width + 2) return null;
  const hour12 = Number(digits.slice(0, width));
  const minute = Number(digits.slice(width));
  if (hour12 < 1 || hour12 > 12 || minute > 59) return null;
  return { hour12, minute };
}

export function to24Hour(hour12: number, minute: number, period: Period): string {
  const hour24 = period === "PM" ? (hour12 % 12) + 12 : hour12 % 12;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hour24)}:${pad(minute)}`;
}

export function formatTime12h(hour24: number, minute: number): string {
  const period: Period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}

export function from24Hour(time24: string): { state: TimeDigits; period: Period } | null {
  if (!isValidTimeFormat(time24)) return null;
  const [hh, mm] = time24.split(":").map(Number);
  const period: Period = hh >= 12 ? "PM" : "AM";
  const hour12 = hh % 12 === 0 ? 12 : hh % 12;
  const hourWidth: 1 | 2 = hour12 >= 10 ? 2 : 1;
  return { state: { digits: `${hour12}${mm.toString().padStart(2, "0")}`, hourWidth }, period };
}
