import { create } from "zustand";

interface CourseStore {
  selectedCourseId: string | null;
  isFormOpen: boolean;
  showDeleteConfirm: boolean;
  setSelectedCourseId: (id: string | null) => void;
  setIsFormOpen: (open: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;
  openFormForNew: () => void;
  openFormForEdit: (id: string) => void;
  closeForm: () => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  selectedCourseId: null,
  isFormOpen: false,
  showDeleteConfirm: false,
  setSelectedCourseId: (id) => set({ selectedCourseId: id }),
  setIsFormOpen: (open) => set({ isFormOpen: open }),
  setShowDeleteConfirm: (show) => set({ showDeleteConfirm: show }),
  openFormForNew: () => set({ selectedCourseId: null, isFormOpen: true }),
  openFormForEdit: (id) => set({ selectedCourseId: id, isFormOpen: true }),
  closeForm: () => set({ isFormOpen: false, selectedCourseId: null }),
}));
