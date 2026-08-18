import { create } from "zustand";
import { getWeekStart, parseISODate, toISODate } from "../hooks/useWeekDays";

interface CreatingWorkSessionAt {
  date: string;
  hour: number;
  useCurrentTimeAsStart?: boolean;
}

interface CalendarStore {
  currentWeekStart: string;
  expandedWorkSessionId: string | null;
  creatingWorkSessionAt: CreatingWorkSessionAt | null;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToToday: () => void;
  goToWeekOf: (date: Date) => void;
  expandWorkSession: (id: string) => void;
  collapseWorkSession: () => void;
  startCreatingWorkSession: (date: string, hour: number, useCurrentTimeAsStart?: boolean) => void;
  stopCreatingWorkSession: () => void;
}

function shiftWeek(weekStartIso: string, days: number): string {
  const d = parseISODate(weekStartIso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  currentWeekStart: toISODate(getWeekStart(new Date())),
  expandedWorkSessionId: null,
  creatingWorkSessionAt: null,
  goToNextWeek: () => set({ currentWeekStart: shiftWeek(get().currentWeekStart, 7) }),
  goToPrevWeek: () => set({ currentWeekStart: shiftWeek(get().currentWeekStart, -7) }),
  goToToday: () => set({ currentWeekStart: toISODate(getWeekStart(new Date())) }),
  goToWeekOf: (date) => set({ currentWeekStart: toISODate(getWeekStart(date)) }),
  expandWorkSession: (id) => set({ expandedWorkSessionId: id }),
  collapseWorkSession: () => set({ expandedWorkSessionId: null }),
  startCreatingWorkSession: (date, hour, useCurrentTimeAsStart) =>
    set({ creatingWorkSessionAt: { date, hour, useCurrentTimeAsStart } }),
  stopCreatingWorkSession: () => set({ creatingWorkSessionAt: null }),
}));
