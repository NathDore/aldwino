import { create } from "zustand";
import { getWeekStart, parseISODate, toISODate } from "../hooks/useWeekDays";

interface CalendarStore {
  currentWeekStart: string;
  expandedEventId: string | null;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToToday: () => void;
  expandEvent: (id: string) => void;
  collapseEvent: () => void;
}

function shiftWeek(weekStartIso: string, days: number): string {
  const d = parseISODate(weekStartIso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  currentWeekStart: toISODate(getWeekStart(new Date())),
  expandedEventId: null,
  goToNextWeek: () => set({ currentWeekStart: shiftWeek(get().currentWeekStart, 7) }),
  goToPrevWeek: () => set({ currentWeekStart: shiftWeek(get().currentWeekStart, -7) }),
  goToToday: () => set({ currentWeekStart: toISODate(getWeekStart(new Date())) }),
  expandEvent: (id) => set({ expandedEventId: id }),
  collapseEvent: () => set({ expandedEventId: null }),
}));
