import { create } from "zustand";
import { getWeekStart, parseISODate, toISODate } from "../hooks/useWeekDays";

interface CreatingAssignmentAt {
  date: string;
  hour: number;
}

interface CalendarStore {
  currentWeekStart: string;
  expandedEventId: string | null;
  creatingAssignmentAt: CreatingAssignmentAt | null;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToToday: () => void;
  expandEvent: (id: string) => void;
  collapseEvent: () => void;
  startCreatingAssignment: (date: string, hour: number) => void;
  stopCreatingAssignment: () => void;
}

function shiftWeek(weekStartIso: string, days: number): string {
  const d = parseISODate(weekStartIso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  currentWeekStart: toISODate(getWeekStart(new Date())),
  expandedEventId: null,
  creatingAssignmentAt: null,
  goToNextWeek: () => set({ currentWeekStart: shiftWeek(get().currentWeekStart, 7) }),
  goToPrevWeek: () => set({ currentWeekStart: shiftWeek(get().currentWeekStart, -7) }),
  goToToday: () => set({ currentWeekStart: toISODate(getWeekStart(new Date())) }),
  expandEvent: (id) => set({ expandedEventId: id }),
  collapseEvent: () => set({ expandedEventId: null }),
  startCreatingAssignment: (date, hour) => set({ creatingAssignmentAt: { date, hour } }),
  stopCreatingAssignment: () => set({ creatingAssignmentAt: null }),
}));
