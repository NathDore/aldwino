import { create } from "zustand";

interface EventStore {
  selectedEventId: string | null;
  isFormOpen: boolean;
  showDeleteConfirm: boolean;
  setSelectedEventId: (id: string | null) => void;
  setIsFormOpen: (open: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;
  openFormForNew: () => void;
  openFormForEdit: (id: string) => void;
  closeForm: () => void;
}

export const useEventStore = create<EventStore>((set) => ({
  selectedEventId: null,
  isFormOpen: false,
  showDeleteConfirm: false,
  setSelectedEventId: (id) => set({ selectedEventId: id }),
  setIsFormOpen: (open) => set({ isFormOpen: open }),
  setShowDeleteConfirm: (show) => set({ showDeleteConfirm: show }),
  openFormForNew: () => set({ selectedEventId: null, isFormOpen: true }),
  openFormForEdit: (id) => set({ selectedEventId: id, isFormOpen: true }),
  closeForm: () => set({ isFormOpen: false, selectedEventId: null }),
}));
