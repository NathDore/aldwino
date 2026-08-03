import { create } from "zustand";
import { toISODate } from "@/features/calendar/hooks/useWeekDays";

interface AssignmentStore {
  selectedStudyDate: string;
}

export const useAssignmentStore = create<AssignmentStore>(() => ({
  selectedStudyDate: toISODate(new Date()),
}));
