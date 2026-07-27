import { create } from "zustand";
import { toISODate } from "@/features/calendar/hooks/useWeekDays";

interface AssignmentStore {
  selectedAssignmentId: string | null;
  assignmentIdPendingDelete: string | null;
  selectedStudyDate: string;
  openFormForEdit: (id: string) => void;
  cancelEdit: () => void;
  requestDelete: (id: string) => void;
  cancelDelete: () => void;
  selectStudyDate: (date: string) => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  selectedAssignmentId: null,
  assignmentIdPendingDelete: null,
  selectedStudyDate: toISODate(new Date()),
  openFormForEdit: (id) => set({ selectedAssignmentId: id }),
  cancelEdit: () => set({ selectedAssignmentId: null }),
  requestDelete: (id) => set({ assignmentIdPendingDelete: id }),
  cancelDelete: () => set({ assignmentIdPendingDelete: null }),
  selectStudyDate: (date) => set({ selectedStudyDate: date }),
}));
