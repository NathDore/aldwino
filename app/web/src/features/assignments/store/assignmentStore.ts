import { create } from "zustand";

interface AssignmentStore {
  selectedAssignmentId: string | null;
  isFormOpen: boolean;
  showDeleteConfirm: boolean;
  setSelectedAssignmentId: (id: string | null) => void;
  setIsFormOpen: (open: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;
  openFormForNew: () => void;
  openFormForEdit: (id: string) => void;
  closeForm: () => void;
}

export const useAssignmentStore = create<AssignmentStore>((set) => ({
  selectedAssignmentId: null,
  isFormOpen: false,
  showDeleteConfirm: false,
  setSelectedAssignmentId: (id) => set({ selectedAssignmentId: id }),
  setIsFormOpen: (open) => set({ isFormOpen: open }),
  setShowDeleteConfirm: (show) => set({ showDeleteConfirm: show }),
  openFormForNew: () => set({ selectedAssignmentId: null, isFormOpen: true }),
  openFormForEdit: (id) => set({ selectedAssignmentId: id, isFormOpen: true }),
  closeForm: () => set({ isFormOpen: false, selectedAssignmentId: null }),
}));
