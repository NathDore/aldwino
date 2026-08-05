import { useMemo } from "react";
import { create } from "zustand";
import { getWeekStart, parseISODate, toISODate } from "../hooks/useWeekDays";

interface CreatingAssignmentAt {
  date: string;
  hour: number;
  useCurrentTimeAsStart?: boolean;
}

interface WeekGridSize {
  width: number;
  height: number;
}

interface CalendarStore {
  currentWeekStart: string;
  expandedEventId: string | null;
  creatingAssignmentAt: CreatingAssignmentAt | null;
  weekGridSize: WeekGridSize | null;
  goToNextWeek: () => void;
  goToPrevWeek: () => void;
  goToToday: () => void;
  expandEvent: (id: string) => void;
  collapseEvent: () => void;
  startCreatingAssignment: (date: string, hour: number, useCurrentTimeAsStart?: boolean) => void;
  stopCreatingAssignment: () => void;
  captureWeekGridSize: (size: WeekGridSize) => void;
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
  weekGridSize: null,
  goToNextWeek: () => set({ currentWeekStart: shiftWeek(get().currentWeekStart, 7) }),
  goToPrevWeek: () => set({ currentWeekStart: shiftWeek(get().currentWeekStart, -7) }),
  goToToday: () => set({ currentWeekStart: toISODate(getWeekStart(new Date())) }),
  expandEvent: (id) => set({ expandedEventId: id }),
  collapseEvent: () => set({ expandedEventId: null }),
  startCreatingAssignment: (date, hour, useCurrentTimeAsStart) =>
    set({ creatingAssignmentAt: { date, hour, useCurrentTimeAsStart } }),
  stopCreatingAssignment: () => set({ creatingAssignmentAt: null }),
  captureWeekGridSize: (size) => {
    if (get().weekGridSize) return;
    set({ weekGridSize: size });
  },
}));

const FORM_WIDTH_MARGIN = 80;
const FORM_HEIGHT_MARGIN = 60;

export function useAssignmentFormSize(): WeekGridSize | null {
  const weekGridSize = useCalendarStore((s) => s.weekGridSize);
  return useMemo(
    () =>
      weekGridSize
        ? { width: weekGridSize.width - FORM_WIDTH_MARGIN, height: weekGridSize.height - FORM_HEIGHT_MARGIN }
        : null,
    [weekGridSize]
  );
}
