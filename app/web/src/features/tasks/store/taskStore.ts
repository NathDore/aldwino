import { create } from "zustand";

interface TaskStore {
  selectedAssignmentId: string | null;
  editingTaskId: string | null;
  isFormOpen: boolean;
  showDeleteConfirm: boolean;
  deleteTaskId: string | null;

  openFormForNew: (assignmentId: string) => void;
  openFormForEdit: (taskId: string) => void;
  closeForm: () => void;
  setShowDeleteConfirm: (show: boolean, taskId?: string | null) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  selectedAssignmentId: null,
  editingTaskId: null,
  isFormOpen: false,
  showDeleteConfirm: false,
  deleteTaskId: null,

  openFormForNew: (assignmentId: string) =>
    set({
      selectedAssignmentId: assignmentId,
      editingTaskId: null,
      isFormOpen: true,
    }),

  openFormForEdit: (taskId: string) =>
    set({
      editingTaskId: taskId,
      isFormOpen: true,
    }),

  closeForm: () =>
    set({
      isFormOpen: false,
      selectedAssignmentId: null,
      editingTaskId: null,
    }),

  setShowDeleteConfirm: (show: boolean, taskId: string | null = null) =>
    set({
      showDeleteConfirm: show,
      deleteTaskId: show ? taskId : null,
    }),
}));
