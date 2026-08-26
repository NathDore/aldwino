import { create } from "zustand";

interface NotificationsSidebarStore {
  isOpen: boolean;
  toggle: () => void;
}

export const useNotificationsSidebarStore = create<NotificationsSidebarStore>((set, get) => ({
  isOpen: false,
  toggle: () => set({ isOpen: !get().isOpen }),
}));
