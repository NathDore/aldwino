import { create } from "zustand";
import { getWeekStart, parseISODate, toISODate } from "../hooks/useWeekDays";

interface SelectedSlot {
  date: string;
  hour: number;
}

interface CalendarStore {
  currentWeekStart: string;
  selectedSlot: SelectedSlot | null;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToToday: () => void;
  setSelectedSlot: (date: string, hour: number) => void;
  clearSelectedSlot: () => void;
}

function shiftWeek(weekStartIso: string, days: number): string {
  const d = parseISODate(weekStartIso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  currentWeekStart: toISODate(getWeekStart(new Date())),
  selectedSlot: null,
  goToNextWeek: () => set({ currentWeekStart: shiftWeek(get().currentWeekStart, 7) }),
  goToPrevWeek: () => set({ currentWeekStart: shiftWeek(get().currentWeekStart, -7) }),
  goToToday: () => set({ currentWeekStart: toISODate(getWeekStart(new Date())) }),
  setSelectedSlot: (date, hour) => set({ selectedSlot: { date, hour } }),
  clearSelectedSlot: () => set({ selectedSlot: null }),
}));
