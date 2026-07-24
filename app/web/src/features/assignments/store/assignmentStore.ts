import { create } from "zustand";

interface AssignmentStore {
  selectedAssignmentId: string | null;
  assignmentIdPendingDelete: string | null;
  openFormForEdit: (id: string) => void;
  cancelEdit: () => void;
  requestDelete: (id: string) => void;
  cancelDelete: () => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  selectedAssignmentId: null,
  assignmentIdPendingDelete: null,
  openFormForEdit: (id) => set({ selectedAssignmentId: id }),
  cancelEdit: () => set({ selectedAssignmentId: null }),
  requestDelete: (id) => set({ assignmentIdPendingDelete: id }),
  cancelDelete: () => set({ assignmentIdPendingDelete: null }),
}));
