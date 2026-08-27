import { create } from "zustand";

interface NotificationsSidebarStore {
  isOpen: boolean;
  toggle: () => void;
  selectedIds: Set<string>;
  toggleSelected: (id: string) => void;
  clearSelected: () => void;
}

export const useNotificationsSidebarStore = create<NotificationsSidebarStore>((set, get) => ({
  isOpen: false,
  toggle: () => set({ isOpen: !get().isOpen, selectedIds: new Set() }),
  selectedIds: new Set(),
  toggleSelected: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedIds: next };
    }),
  clearSelected: () => set({ selectedIds: new Set() }),
}));
